class WelcomeBonus extends HTMLElement {
  async connectedCallback() {
    const src = this.getAttribute('src');

    try {
      const response = await fetch(src);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      console.log('Campaign data:', data);
    } catch (error) {
      console.error('Could not load campaign:', error);
    }
  }
}

customElements.define('welcome-bonus', WelcomeBonus);
