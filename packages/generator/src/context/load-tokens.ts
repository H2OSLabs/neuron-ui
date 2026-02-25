/**
 * Load design token constraints for prompt injection.
 * This tells the AI which token values are valid.
 */
export function loadTokensForPrompt(): string {
  return JSON.stringify({
    colors: {
      gray: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14'],
      accent: ['pink', 'pink-light', 'yellow', 'yellow-bright', 'lime', 'lime-light', 'green', 'blue', 'purple', 'lavender'],
      semantic: ['error', 'warning', 'success'],
    },
    spacing: ['4', '8', '12', '16', '20', '24', '32', '36', '48', '64'],
    radius: ['xs', 'sm', 'md', 'lg', 'full'],
    fontSize: ['display', 'heading', 'subheading', 'section', 'body-lg', 'body', 'caption'],
    fontWeight: ['normal', 'medium', 'semibold', 'bold'],
  }, null, 2)
}
