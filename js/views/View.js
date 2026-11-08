export default class View {
  _data;

  constructor(parentSelector) {
    this._parentElement = parentSelector ? document.querySelector(parentSelector) : null;
  }

  render(data) {
    if (!this._parentElement) {
      throw new Error(`${this.constructor.name} has no parent element.`);
    }
    if (!data) return;

    this._data = data;
    const markup = this._generateMarkup();
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  update(data) {
    if (!this._parentElement) return;

    this._data = data;
    const newMarkup = this._generateMarkup();
    const newDom = document.createRange().createContextualFragment(newMarkup);
    const newElements = Array.from(newDom.querySelectorAll('*'));
    const currentElements = Array.from(this._parentElement.querySelectorAll('*'));

    newElements.forEach((newElement, index) => {
      const currentElement = currentElements[index];
      if (!currentElement || newElement.isEqualNode(currentElement)) return;

      if (newElement.firstChild?.nodeValue?.trim() && currentElement.firstChild) {
        currentElement.textContent = newElement.textContent;
      }

      Array.from(newElement.attributes).forEach((attribute) => {
        currentElement.setAttribute(attribute.name, attribute.value);
      });
    });
  }

  scrollIntoView() {
    this._parentElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  _clear() {
    this._parentElement.innerHTML = '';
  }

  _generateMarkup() {
    throw new Error(`${this.constructor.name} must implement _generateMarkup().`);
  }
}
