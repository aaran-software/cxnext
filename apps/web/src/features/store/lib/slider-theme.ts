import type { CommonModuleItem } from "@shared/index"

export type SliderThemeRecord = CommonModuleItem & {
  code: string
  name: string
  sortOrder: number
  addToCartLabel: string | null
  viewDetailsLabel: string | null
  backgroundFrom: string
  backgroundVia: string
  backgroundTo: string
  textColor: string | null
  mutedTextColor: string | null
  badgeBackground: string | null
  badgeTextColor: string | null
  primaryButtonBackground: string | null
  primaryButtonTextColor: string | null
  secondaryButtonBackground: string | null
  secondaryButtonTextColor: string | null
  navBackground: string | null
  navTextColor: string | null
}

type ResolvedSliderThemeStyles = {
  background: string
  textColor: string
  mutedTextColor: string
  badgeBackground: string
  badgeTextColor: string
  primaryButtonBackground: string
  primaryButtonTextColor: string
  secondaryButtonBackground: string
  secondaryButtonTextColor: string
  navBackground: string
  navTextColor: string
  addToCartLabel: string
  viewDetailsLabel: string
  isDark: boolean
}

const fallbackSliderThemes: SliderThemeRecord[] = [
  createFallbackTheme("signature-01", "Signature Ember", 10, "#2b1a14", "#6b4633", "#f2ddc8"),
  createFallbackTheme("signature-02", "Espresso Sand", 20, "#241913", "#7a523d", "#f0dcc8"),
  createFallbackTheme("signature-03", "Walnut Glow", 30, "#201611", "#5f4334", "#e9d6c3"),
  createFallbackTheme("signature-04", "Mocha Bronze", 40, "#2f1e18", "#8a5a40", "#efcfac"),
  createFallbackTheme("signature-05", "Cocoa Linen", 50, "#311f19", "#7a503c", "#f6e6d3"),
  createFallbackTheme("signature-06", "Sienna Cream", 60, "#3b241b", "#965f43", "#f7dcc0"),
  createFallbackTheme("signature-07", "Toffee Mist", 70, "#4b2f22", "#9e684c", "#f3e3d4"),
  createFallbackTheme("signature-08", "Roast Almond", 80, "#352119", "#8f5a41", "#eed4ba"),
  createFallbackTheme("signature-09", "Vintage Copper", 90, "#281913", "#794b37", "#e6c9af", {
    addToCartLabel: "Shop now",
    viewDetailsLabel: "Explore details",
  }),
  createFallbackTheme("signature-10", "Noir Beige", 100, "#1e1410", "#604031", "#ddc1aa"),
]

function createFallbackTheme(
  code: string,
  name: string,
  sortOrder: number,
  backgroundFrom: string,
  backgroundVia: string,
  backgroundTo: string,
  overrides?: Partial<Pick<SliderThemeRecord, "addToCartLabel" | "viewDetailsLabel">>,
): SliderThemeRecord {
  return {
    id: `slider-theme:${code}`,
    isActive: true,
    createdAt: "",
    updatedAt: "",
    code,
    name,
    sortOrder,
    addToCartLabel: overrides?.addToCartLabel ?? "Add to cart",
    viewDetailsLabel: overrides?.viewDetailsLabel ?? "View details",
    backgroundFrom,
    backgroundVia,
    backgroundTo,
    textColor: null,
    mutedTextColor: null,
    badgeBackground: null,
    badgeTextColor: null,
    primaryButtonBackground: null,
    primaryButtonTextColor: null,
    secondaryButtonBackground: null,
    secondaryButtonTextColor: null,
    navBackground: null,
    navTextColor: null,
  }
}

function normalizeText(value: unknown) {
  if (typeof value !== "string") {
    return ""
  }

  return value.trim()
}

function normalizeNullableText(value: unknown) {
  const normalized = normalizeText(value)
  return normalized.length > 0 ? normalized : null
}

function normalizeColor(value: unknown, fallback: string) {
  const normalized = normalizeText(value)
  return /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(normalized) ? normalized : fallback
}

function normalizeNullableColor(value: unknown) {
  const normalized = normalizeText(value)
  return /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(normalized) ? normalized : null
}

function normalizeNumber(value: unknown, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "")
  const expanded = normalized.length === 3
    ? normalized.split("").map((part) => `${part}${part}`).join("")
    : normalized.slice(0, 6)

  const red = Number.parseInt(expanded.slice(0, 2), 16)
  const green = Number.parseInt(expanded.slice(2, 4), 16)
  const blue = Number.parseInt(expanded.slice(4, 6), 16)

  return { red, green, blue }
}

function channelToLinear(channel: number) {
  const normalized = channel / 255
  return normalized <= 0.03928
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4
}

function getRelativeLuminance(hex: string) {
  const { red, green, blue } = hexToRgb(hex)
  return (
    0.2126 * channelToLinear(red) +
    0.7152 * channelToLinear(green) +
    0.0722 * channelToLinear(blue)
  )
}

function mixHexColors(from: string, to: string, ratio: number) {
  const start = hexToRgb(from)
  const end = hexToRgb(to)
  const clamp = Math.max(0, Math.min(1, ratio))
  const red = Math.round(start.red + (end.red - start.red) * clamp)
  const green = Math.round(start.green + (end.green - start.green) * clamp)
  const blue = Math.round(start.blue + (end.blue - start.blue) * clamp)
  return `#${[red, green, blue].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`
}

function withAlpha(hex: string, alphaHex: string) {
  return `${hex}${alphaHex}`
}

export function getFallbackSliderThemes() {
  return fallbackSliderThemes.map((theme) => ({ ...theme }))
}

export function toSliderThemeRecord(item: CommonModuleItem): SliderThemeRecord {
  return {
    ...item,
    code: normalizeText(item.code),
    name: normalizeText(item.name),
    sortOrder: normalizeNumber(item.sort_order, 0),
    addToCartLabel: normalizeNullableText(item.add_to_cart_label),
    viewDetailsLabel: normalizeNullableText(item.view_details_label),
    backgroundFrom: normalizeColor(item.background_from, "#2b1a14"),
    backgroundVia: normalizeColor(item.background_via, "#6b4633"),
    backgroundTo: normalizeColor(item.background_to, "#f2ddc8"),
    textColor: normalizeNullableColor(item.text_color),
    mutedTextColor: normalizeNullableColor(item.muted_text_color),
    badgeBackground: normalizeNullableColor(item.badge_background),
    badgeTextColor: normalizeNullableColor(item.badge_text_color),
    primaryButtonBackground: normalizeNullableColor(item.primary_button_background),
    primaryButtonTextColor: normalizeNullableColor(item.primary_button_text_color),
    secondaryButtonBackground: normalizeNullableColor(item.secondary_button_background),
    secondaryButtonTextColor: normalizeNullableColor(item.secondary_button_text_color),
    navBackground: normalizeNullableColor(item.nav_background),
    navTextColor: normalizeNullableColor(item.nav_text_color),
  }
}

export function pickSliderTheme(themes: SliderThemeRecord[], index: number) {
  if (themes.length === 0) {
    return fallbackSliderThemes[0]
  }

  const safeIndex = ((index % themes.length) + themes.length) % themes.length
  return themes[safeIndex] ?? themes[0] ?? fallbackSliderThemes[0]
}

export function resolveSliderThemeStyles(theme: SliderThemeRecord): ResolvedSliderThemeStyles {
  const averageTone = mixHexColors(theme.backgroundFrom, theme.backgroundVia, 0.45)
  const isDark = getRelativeLuminance(averageTone) < 0.42
  const textColor = theme.textColor ?? (isDark ? "#ffffff" : "#111111")
  const mutedTextColor = theme.mutedTextColor ?? (isDark ? "#efe2d6" : "#3f342d")
  const primaryButtonBackground = theme.primaryButtonBackground ?? (isDark ? "#ffffff" : "#1b140f")
  const primaryButtonTextColor = theme.primaryButtonTextColor ?? (isDark ? "#1a120f" : "#ffffff")
  const secondaryButtonBackground = theme.secondaryButtonBackground ?? (isDark ? withAlpha("#ffffff", "30") : withAlpha("#ffffff", "b8"))
  const secondaryButtonTextColor = theme.secondaryButtonTextColor ?? textColor
  const navBackground = theme.navBackground ?? (isDark ? withAlpha("#ffffff", "d9") : withAlpha("#ffffff", "cc"))
  const navTextColor = theme.navTextColor ?? (isDark ? "#1a120f" : "#111111")
  const badgeBackground = theme.badgeBackground ?? (isDark ? withAlpha("#ffffff", "33") : withAlpha("#111111", "14"))
  const badgeTextColor = theme.badgeTextColor ?? textColor

  return {
    background: `linear-gradient(118deg, ${theme.backgroundFrom} 0%, ${theme.backgroundVia} 48%, ${theme.backgroundTo} 100%)`,
    textColor,
    mutedTextColor,
    badgeBackground,
    badgeTextColor,
    primaryButtonBackground,
    primaryButtonTextColor,
    secondaryButtonBackground,
    secondaryButtonTextColor,
    navBackground,
    navTextColor,
    addToCartLabel: theme.addToCartLabel ?? "Add to cart",
    viewDetailsLabel: theme.viewDetailsLabel ?? "View details",
    isDark,
  }
}
