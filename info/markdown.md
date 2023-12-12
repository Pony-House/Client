# Timestamps

Pony House timestamps can be useful for specifying a date/time across multiple users time zones. They work with the Unix Timestamp format and can be posted by regular users as well as bots and applications.

[The Epoch Unix Time Stamp Converter](https://www.unixtimestamp.com/) is a good way to quickly generate a timestamp. For the examples below I will be using the Time Stamp of `1543392060`, which represents `November 28th, 2018` at `09:01:00` hours for my local time zone (GMT+0100 Central European Standard Time).

## Formatting

| Style           | Input              | Output (12-hour clock)               | Output (24-hour clock)            |
| --------------- | ------------------ | ------------------------------------ | --------------------------------- |
| Short Time      | `{t:1543392060:t}` | 9:01 AM                              | 09:01                             |
| Long Time       | `{t:1543392060:T}` | 9:01:00 AM                           | 09:01:00                          |
| Short Date      | `{t:1543392060:d}` | 11/28/2018                           | 28/11/2018                        |
| Long Date       | `{t:1543392060:D}` | November 28, 2018                    | 28 November 2018                  |
| Short Date/Time | `{t:1543392060:f}` | November 28, 2018 9:01 AM            | 28 November 2018 09:01            |
| Long Date/Time  | `{t:1543392060:F}` | Wednesday, November 28, 2018 9:01 AM | Wednesday, 28 November 2018 09:01 |
| Relative Time   | `{t:1543392060:R}` | 3 years ago                          | 3 years ago                       |

Sources:

[Dan's Tools](https://www.unixtimestamp.com/)

<hr/>

Credits: https://gist.github.com/LeviSnoot/d9147767abeef2f770e9ddcd91eb85aa
