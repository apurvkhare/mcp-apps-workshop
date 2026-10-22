import { defineMermaidSetup } from '@slidev/types'

/**
 * Global Mermaid theme for the deck — warm Editorial Ink instead of the cool
 * default slate. Per-node `style X fill:#...` directives in the diagrams still
 * win over these defaults, so the highlighted nodes keep their semantic colors.
 */
export default defineMermaidSetup(() => {
  return {
    theme: 'base',
    themeVariables: {
      darkMode: true,
      background: 'transparent',
      fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      // default node
      primaryColor: '#211d17',
      primaryTextColor: '#f4eee3',
      primaryBorderColor: '#3d3528',
      secondaryColor: '#2a241b',
      secondaryTextColor: '#f4eee3',
      secondaryBorderColor: '#3d3528',
      tertiaryColor: '#1a1712',
      tertiaryTextColor: '#f4eee3',
      tertiaryBorderColor: '#3d3528',
      // edges + labels
      lineColor: '#a1927a',
      textColor: '#f4eee3',
      // flowchart label background (the Yes/No edge labels)
      edgeLabelBackground: '#14110d',
      clusterBkg: 'rgba(217,116,78,0.06)',
      clusterBorder: '#574b39',
      nodeBorder: '#3d3528',
      titleColor: '#fbf7f0',
    },
  }
})
