export function baseNode(header: string, content: string, ports: string) {
  return /*html*/ `
    <div class="header">${header}</div>
    <div class="content">${content}</div>
    <div class="ports-grid">${ports}</div>
    `;
}

export const sharedStyles = /*css*/ `
  :host {
    display: block;
    contain: layout style;
  }

  .container {
    background: var(--panel);
    border: 1px solid var(--border);
    color: var(--text);
    border-radius: 8px;
    min-width: 200px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
    overflow: hidden;
  }

  .header {
    background: rgba(255, 255, 255, 0.02);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    padding: 12px;
    font-size: 10px;
    font-weight: bold;
    text-transform: uppercase;
    color: var(--accent);
  }

  input[type="range"] {
    width: 100%;
    height: 6px;
    -webkit-appearance: none;
    background: var(--border);
    border-radius: 5px;
    outline: none;
  }

  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 14px; height: 14px;
    border-radius: 50%;
    background: var(--accent);
    border: 2px solid var(--panel);
  }
`;
