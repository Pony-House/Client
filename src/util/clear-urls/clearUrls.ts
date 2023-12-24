// adapted from Vencord
// https://github.com/Vendicated/Vencord/blob/main/src/plugins/clearURLs/index.ts

import { defaultRules } from './defaultRules';

function escapeRegExp(str: string): string {
  const reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
  const reHasRegExpChar = RegExp(reRegExpChar.source);

  return str && reHasRegExpChar.test(str) ? str.replace(reRegExpChar, '\\$&') : str || '';
}

function removeParam(rule: string | RegExp, param: string, parent: URLSearchParams) {
  if (param === rule || (rule instanceof RegExp && rule.test(param))) {
    parent.delete(param);
  }
}

const universalRules = new Set<RegExp>();
const rulesByHost = new Map<string, Set<RegExp>>();
const hostRules = new Map<string, RegExp>();

function parseRule(rule: string) {
  const splitRule = rule.split('@');
  const paramRuleRegexInner = escapeRegExp(splitRule[0]).replace(/\\\*/, '.+?');
  const paramRule = new RegExp(`^${paramRuleRegexInner}$`);

  if (!splitRule[1]) {
    universalRules.add(paramRule);
    return;
  }

  const hostRuleRegexInner = escapeRegExp(splitRule[1])
    .replace(/\\\./, '\\.')
    .replace(/^\\\*\\\./, '(.+?\\.)?')
    .replace(/\\\*/, '.+?');
  const hostRule = new RegExp(`^(www\\.)?${hostRuleRegexInner}$`);
  const hostRuleIndex = hostRule.toString();

  hostRules.set(hostRuleIndex, hostRule);
  if (rulesByHost.get(hostRuleIndex) == null) {
    rulesByHost.set(hostRuleIndex, new Set());
  }
  rulesByHost.get(hostRuleIndex).add(paramRule);
}

const rules = defaultRules;
for (let ruleIndex = 0; ruleIndex < rules.length; ruleIndex += 1) {
  parseRule(rules[ruleIndex]);
}

export function clearUrl(match: string): string {
  // Parse URL without throwing errors
  let url: URL;
  try {
    url = new URL(match);
  } catch (error) {
    // Don't modify anything if we can't parse the URL
    return match;
  }

  // Cheap way to check if there are any search params
  if (url.searchParams.entries().next().done) {
    // If there are none, we don't need to modify anything
    return match;
  }

  // Check all universal rules
  universalRules.forEach((rule) => {
    url.searchParams.forEach((_value, param, parent) => {
      removeParam(rule, param, parent);
    });
  });

  // Check rules for each hosts that match
  hostRules.forEach((regex, hostRuleName) => {
    if (!regex.test(url.hostname)) return;
    rulesByHost.get(hostRuleName).forEach((rule) => {
      url.searchParams.forEach((_value, param, parent) => {
        removeParam(rule, param, parent);
      });
    });
  });

  return url.toString();
}

export function clearUrlsFromHtml(text: string): string {
  // put it in the dom to get the a tags
  const div = document.createElement('div');
  div.innerHTML = text;
  const links = div.getElementsByTagName('a');
  for (let i = 0; i < links.length; i += 1) {
    const link = links[i];
    const href = link.getAttribute('href');
    if (href) {
      const clearedUrl = clearUrl(href);
      link.setAttribute('href', clearedUrl);
    }
  }
  return div.innerHTML;
}

export function clearUrlsFromText(text: string): string {
  const regex = /https?:\/\/[^\s<]+[^<.,:;"'>)|\]\s]/g;
  return text.replace(regex, (match) => clearUrl(match));
}
