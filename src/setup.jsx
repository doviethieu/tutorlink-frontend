import '@testing-library/jest-dom/vitest';
import React from 'react';
import { vi } from 'vitest';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

window.alert = vi.fn();
window.confirm = vi.fn(() => true);
window.scrollTo = vi.fn();
window.open = vi.fn();
window.prompt = vi.fn(() => 'test');
Element.prototype.scrollIntoView = vi.fn();

vi.mock('@radix-ui/react-dropdown-menu', () => {
  const Part = ({ children, asChild, ...props }) => {
    if (asChild) return <>{children}</>;
    return <div {...props}>{children}</div>;
  };
  return {
    Root: ({ children }) => <div>{children}</div>,
    Trigger: Part,
    Portal: ({ children }) => <>{children}</>,
    Content: Part,
    Item: Part,
    Separator: (props) => <div {...props} />,
  };
});

vi.mock('@react-oauth/google', () => ({
  GoogleOAuthProvider: ({ children }) => <div data-testid="google-provider">{children}</div>,
  GoogleLogin: ({ onSuccess }) => (
    <button type="button" onClick={() => onSuccess?.({ credential: 'google-token' })}>
      Google Login
    </button>
  ),
}));

vi.mock('@zegocloud/zego-uikit-prebuilt', () => ({
  ZegoUIKitPrebuilt: {
    generateKitTokenForTest: vi.fn(() => 'zego-token'),
    create: vi.fn(() => ({ joinRoom: vi.fn() })),
  },
}));

vi.mock('react-nice-avatar', () => ({
  default: ({ className, style }) => <span data-testid="nice-avatar" className={className} style={style} />,
}));
