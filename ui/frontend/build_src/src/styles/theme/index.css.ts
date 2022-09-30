import {
  createGlobalTheme,
  createThemeContract,
  createTheme,
} from "@vanilla-extract/css";

/**
 * Colors are all the same across the themes, this is just to set up a contract
 * Colors can be decided later. I am just the architect.
 * Tried to pull things from the original app.
 *
 * Lots of these arent used yet, but once they are defined and useable then they can be set.
 */

// const SharedColors = {

//   pending: null,
//   processing: null,
//   paused: null,

//   link: null,

//   warning: null,
//   error: null,
//   success: null,

// }

const colors = createThemeContract({
  brand: null,
  brandDimmed: null,
  brandHover: null,
  brandActive: null,
  brandAccent: null,
  brandAccentDimmed: null,
  brandAccentActive: null,

  secondary: null,
  secondaryDimmed: null,
  secondaryHover: null,
  secondaryActive: null,
  secondaryAccent: null,
  secondaryAccentDimmed: null,
  secondaryAccentActive: null,

  background: null,
  backgroundAccent: null,
  backgroundAlt: null,
  backgroundAltAccent: null,
  backgroundDark: null,
  backgroundDarkAccent: null,

  text: {
    normal: null,
    dimmed: null,

    secondary: null,
    secondaryDimmed: null,

    accent: null,
    accentDimmed: null,
  },

  // pending: null,
  // processing: null,
  // paused: null,


  link: null,

  warning: null,
  error: null,
  success: null,
});

const app = createGlobalTheme(":root", {
  spacing: {
    none: "0",
    min: "2px",
    small: "5px",
    medium: "10px",
    large: "25px",
  },

  trim: {
    smallBorderRadius: "5px",
  },

  fonts: {
    body: "Arial, Helvetica, sans-serif;",
    // IconFont is a shared class for now
    sizes: {
      Title: "2em",
      Headline: "1.5em",
      Subheadline: "1.20em",
      SubSubheadline: "1.1em",
      Body: "1em",
      Plain: "0.8em",
      Caption: ".75em",
      Overline: ".5em",
    },
  },
  colors,

  brandHue: '265',
  secondaryHue: '54',
  tertiaryHue: '116',

  errorHue: '0',
  warningHue: '60',
  successHue: '120',

  colorMod: {
    saturation: {
      normal: "70%",
      bright: "100%",
      dim: "30%",
    },
    lightness: {
      normal: "50%",
      bright: "60%",
      dim: "40%",
    },
  },

});

export const darkTheme = createTheme(colors, {
  brand: "#5000b9", // purple
  brandDimmed: "#433852", // muted purple
  brandHover: "#5d00d6", // bringhter purple
  brandActive: "#5d00d6", // bringhter purple
  brandAccent: "#28004e", // darker purple
  brandAccentDimmed: "#28004e", // darker purple
  brandAccentActive: "#28004e", // darker purple

  secondary: "#0b8334", // green
  secondaryDimmed: "#0b8334", // green
  secondaryHover: "#0b8334", // green
  secondaryActive: "#0b8334", // green
  secondaryAccent: "#0b8334", // green
  secondaryAccentDimmed: "#0b8334", // green
  secondaryAccentActive: "#0b8334", // green

  background: "#202124", // dark grey
  backgroundAccent: " #383838", // lighter grey

  backgroundAlt: "#2c2d30", // med grey
  backgroundAltAccent: "#383838", // lighter grey

  backgroundDark: "#121213", // darker grey
  backgroundDarkAccent: "#383838", // lighter grey

  text: {
    normal: "#ffffff", // white
    dimmed: "#d1d5db", // off white

    secondary: "#ffffff", // white
    secondaryDimmed: "#d1d5db", // off white

    accent: "#e7ba71", // orange
    accentDimmed: "#7d6641", // muted orange
  },

  link: "#0066cc", // blue
  warning: "#f0ad4e",
  error: "#d9534f",
  success: "#5cb85c",
});

// Generated by co-pilot
export const lightTheme = createTheme(colors, {
  brand: "#1E40AF",
  brandDimmed: "#1E40AF",
  brandHover: "#1E40AF",
  brandActive: "#1E40AF",
  brandAccent: "#1E40AF",
  brandAccentDimmed: "#1E40AF",
  brandAccentActive: "#1E40AF",

  secondary: "#DB2777",
  secondaryDimmed: "#DB2777",
  secondaryHover: "#DB2777",
  secondaryActive: "#DB2777",
  secondaryAccent: "#DB2777",
  secondaryAccentDimmed: "#DB2777",
  secondaryAccentActive: "#DB2777",

  background: "#EFF6FF",
  backgroundAccent: "#EFF6FF",
  backgroundAlt: "#EFF6FF",
  backgroundAltAccent: "#EFF6FF",
  backgroundDark: "#EFF6FF",
  backgroundDarkAccent: "#EFF6FF",

  text: {
    normal: "#1F2937",
    dimmed: "#6B7280",

    secondary: "#1F2937",
    secondaryDimmed: "#6B7280",

    accent: "#1F2937",
    accentDimmed: "#6B7280",
  },

  link: "#0066cc", // blue
  warning: "yellow",
  error: "red",
  success: "green",
});

export const vars = { ...app, colors };
