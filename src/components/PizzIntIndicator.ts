import type { PizzIntStatus, GdeltTensionPair } from '@/types';
import { escapeHtml } from '@/utils/sanitize';

export class PizzIntIndicator {
  private element: HTMLElement;
  private isExpanded = false;
  private tensions: GdeltTensionPair[] = [];

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'pizzint-indicator';
    this.element.innerHTML = `
      <button class="pizzint-toggle" title="Geopolitical Tensions">
        <span class="pizzint-icon">🌐</span>
        <span class="pizzint-label">Tensions</span>
        <span class="pizzint-top-score">--</span>
      </button>
      <div class="pizzint-panel hidden">
        <div class="pizzint-header">
          <span class="pizzint-title">Geopolitical Tensions</span>
          <button class="pizzint-close">×</button>
        </div>
        <div class="pizzint-tensions">
          <div class="pizzint-tensions-list"></div>
        </div>
        <div class="pizzint-footer">
          <span class="pizzint-source">Source: <a href="https://www.gdeltproject.org" target="_blank" rel="noopener">GDELT</a></span>
        </div>
      </div>
    `;

    this.injectStyles();
    this.setupEventListeners();
  }

  private injectStyles(): void {
    if (document.getElementById('pizzint-styles')) return;
    const style = document.createElement('style');
    style.id = 'pizzint-styles';
    style.textContent = `
      .pizzint-indicator {
        position: relative;
        z-index: 1000;
        font-family: 'JetBrains Mono', monospace;
      }
      .pizzint-toggle {
        display: flex;
        align-items: center;
        gap: 6px;
        background: transparent;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 4px;
        padding: 4px 8px;
        cursor: pointer;
        transition: all 0.2s;
      }
      .pizzint-toggle:hover {
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.4);
      }
      .pizzint-icon { font-size: 14px; }
      .pizzint-label {
        font-size: 10px;
        color: rgba(255, 255, 255, 0.7);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .pizzint-top-score {
        font-size: 10px;
        font-weight: bold;
        padding: 2px 5px;
        border-radius: 3px;
        background: #444;
        color: #fff;
      }
      .pizzint-panel {
        position: absolute;
        top: 100%;
        left: 0;
        margin-top: 8px;
        width: 320px;
        background: rgba(0, 0, 0, 0.95);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
      }
      .pizzint-panel.hidden { display: none; }
      .pizzint-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }
      .pizzint-title {
        font-size: 14px;
        font-weight: bold;
        color: #fff;
      }
      .pizzint-close {
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.5);
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        line-height: 1;
      }
      .pizzint-close:hover { color: #fff; }
      .pizzint-tensions {
        padding: 12px 16px;
      }
      .pizzint-tension-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 4px 0;
        font-size: 11px;
      }
      .pizzint-tension-label { color: rgba(255, 255, 255, 0.8); }
      .pizzint-tension-score {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .pizzint-tension-value { color: #fff; font-weight: bold; }
      .pizzint-tension-trend { font-size: 10px; }
      .pizzint-tension-trend.rising { color: #ff4400; }
      .pizzint-tension-trend.falling { color: #00ff88; }
      .pizzint-tension-trend.stable { color: #888; }
      .pizzint-footer {
        display: flex;
        justify-content: space-between;
        padding: 8px 16px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        font-size: 10px;
        color: rgba(255, 255, 255, 0.4);
      }
      .pizzint-footer a {
        color: rgba(255, 255, 255, 0.6);
        text-decoration: none;
      }
      .pizzint-footer a:hover { color: #fff; }
    `;
    document.head.appendChild(style);
  }

  private setupEventListeners(): void {
    const toggle = this.element.querySelector('.pizzint-toggle')!;
    const panel = this.element.querySelector('.pizzint-panel')!;
    const closeBtn = this.element.querySelector('.pizzint-close')!;

    toggle.addEventListener('click', () => {
      this.isExpanded = !this.isExpanded;
      panel.classList.toggle('hidden', !this.isExpanded);
    });

    closeBtn.addEventListener('click', () => {
      this.isExpanded = false;
      panel.classList.add('hidden');
    });
  }

  // Keep for API compatibility — no-op now
  public updateStatus(_status: PizzIntStatus): void {}

  public updateTensions(tensions: GdeltTensionPair[]): void {
    this.tensions = tensions;
    this.renderTensions();
  }

  private renderTensions(): void {
    const listEl = this.element.querySelector('.pizzint-tensions-list') as HTMLElement;
    if (!listEl) return;

    // Update the top score badge in the toggle button
    const topScoreEl = this.element.querySelector('.pizzint-top-score') as HTMLElement;
    if (topScoreEl && this.tensions.length > 0) {
      const maxScore = Math.max(...this.tensions.map(t => t.score));
      topScoreEl.textContent = maxScore.toFixed(1);
      if (maxScore >= 8) {
        topScoreEl.style.background = '#ff0040';
      } else if (maxScore >= 5) {
        topScoreEl.style.background = '#ff4400';
      } else if (maxScore >= 3) {
        topScoreEl.style.background = '#ffaa00';
        topScoreEl.style.color = '#000';
      } else {
        topScoreEl.style.background = '#2d8a6e';
      }
    }

    listEl.innerHTML = this.tensions.map(t => {
      const trendIcon = t.trend === 'rising' ? '↑' : t.trend === 'falling' ? '↓' : '→';
      const changeText = t.changePercent > 0 ? `+${t.changePercent}%` : `${t.changePercent}%`;
      const trendClass = escapeHtml(t.trend);
      return `
        <div class="pizzint-tension-row">
          <span class="pizzint-tension-label">${escapeHtml(t.label)}</span>
          <span class="pizzint-tension-score">
            <span class="pizzint-tension-value">${t.score.toFixed(1)}</span>
            <span class="pizzint-tension-trend ${trendClass}">${trendIcon} ${changeText}</span>
          </span>
        </div>
      `;
    }).join('');
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  public hide(): void {
    this.element.style.display = 'none';
  }

  public show(): void {
    this.element.style.display = '';
  }
}
