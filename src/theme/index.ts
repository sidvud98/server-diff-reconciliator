export const theme = {
  colors: {
    primary: "#1b69de",
    background: "#242424",
    backgroundLight: "#ffffff",
    text: {
      primary: "#213547",
      light: "rgba(255, 255, 255, 0.87)",
    },
    button: {
      background: "#1a1a1a",
      backgroundLight: "#f9f9f9",
    },
    status: {
      correct: "#6cdb6c",
      incorrect: "#f44336",
    },
    border: {
      default: "#ccc",
    },
  },
  spacing: {
    xs: "0.5rem",
    sm: "1rem",
    md: "1.5rem",
    lg: "2rem",
    xl: "3rem",
  },
  borderRadius: {
    sm: "4px",
    md: "8px",
    lg: "12px",
  },
  shadows: {
    default: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
  },
  fontSize: {
    small: "1rem",
    medium: "1.5rem",
    large: "2rem",
    xlarge: "3.2rem",
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semiBold: 600,
    bold: 700,
  },
} as const;

export type Theme = typeof theme;
