// @vitest-environment jsdom
/**
 * 🧪 5.2 tenet-ui's tokens point at the host's variables, when the host sent them.
 */
import { describe, expect, test } from 'vitest';
import { TOKEN_MAP, bridgeHostTheme } from '../ui/host-bridge.ts';

const fresh = () => document.createElement('div');

describe('5.2 design tokens', () => {
  test('TOKEN_MAP covers fonts and corner radii', () => {
    expect(TOKEN_MAP).toMatchObject({
      '--fontFamily-body': '--font-sans',
      '--fontFamily-mono': '--font-mono',
      '--borderRadius-medium': '--border-radius-md',
      '--borderRadius-large': '--border-radius-lg'
    });
  });

  test('points each token at the host variable the host sent', () => {
    const root = fresh();
    bridgeHostTheme({ styles: { variables: { '--color-text-primary': '#111', '--font-sans': 'Inter' } } } as never, root);
    expect(root.style.getPropertyValue('--fgColor-default')).toBe('var(--color-text-primary)');
    expect(root.style.getPropertyValue('--fontFamily-body')).toBe('var(--font-sans)');
  });

  test("leaves tokens alone when the host didn't send that variable", () => {
    const root = fresh();
    bridgeHostTheme({ styles: { variables: { '--font-sans': 'Inter' } } } as never, root);
    expect(root.style.getPropertyValue('--bgColor-default')).toBe('');
  });

  test('removes tokens from the last host when the next one sends less', () => {
    const root = fresh();
    bridgeHostTheme({ styles: { variables: { '--color-text-primary': '#111' } } } as never, root);
    bridgeHostTheme({ styles: { variables: {} } } as never, root);
    expect(root.style.getPropertyValue('--fgColor-default')).toBe('');
  });

  test('still follows the theme', () => {
    const root = fresh();
    bridgeHostTheme({ theme: 'dark' }, root);
    expect(root.dataset.colorMode).toBe('dark');
  });
});
