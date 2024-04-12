export function objType(obj, type) {
  // Is Defined
  if (typeof obj !== 'undefined') {
    // Check Obj Type
    if (typeof type === 'string') {
      if (Object.prototype.toString.call(obj).toLowerCase() === `[object ${type}]`) {
        return true;
      }

      return false;
    }

    // Get Obj Type

    // Result
    const result = Object.prototype.toString.call(obj).toLowerCase();

    // Send Result
    return result.substring(8, result.length - 1);
  }

  // Nope
  return null;
}
