import { version as packageVersion } from '../../../package.json'

export const [version, buildNumber = '0'] = packageVersion.split('-');

// tests the variant against control to determine if
// an update is needed.
export const isUpdateNeeded = (variant = '', control = '') => {

  // official semvar regex
  // https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string
  const pattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/

  if (!pattern.test(control)) {
    throw new Error('control semver input is invalid, cannot test isUpdateNeeded. Please use a valid semver')
  }

  if (!pattern.test(variant)) {
    throw new Error('variant semver input is invalid, cannot test isUpdateNeeded. Please use a valid semver')
  }

  // uses 'as RegexpMatchArray' because TS does not understand pattern.test guarantees a Match
  // then we slice offunused match[0] to keep lint happy
  const [controlMajor, controlMinor, controlPatch] = (control.match(pattern) as RegExpMatchArray).slice(1)
  const [variantMajor, variantMinor, variantPatch] = (variant.match(pattern) as RegExpMatchArray).slice(1)

  // compare versions, if variant is greater than control, return true
  if (controlMajor !== variantMajor) {
    return variantMajor > controlMajor
  }

  if (controlMinor !== variantMinor) {
    return variantMinor > controlMinor
  }

  if (controlPatch !== variantPatch) {
    return variantPatch > controlPatch
  }

  return false
}
