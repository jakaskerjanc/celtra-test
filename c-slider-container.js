const template = document.createElement("template");
template.innerHTML = `
<div class="outer">
  <div id="legend-container">
  </div>
  <svg id="svg-container">
  </svg>
</div>
<style>
  .outer{
    display: flex;
    flex-wrap: wrap-reverse;
    align-items: center;    
    justify-content: center;
    background: linear-gradient(0deg, rgba(187, 187, 187, 1) 0%, rgba(221, 221, 221, 1) 59%);
  }
   #legend-container>div{
    display: grid;
    grid-template-columns: 9rem 3rem auto;
    align-items: center;
  }
  #legend-container h1{
    font-size: 3rem;
    margin: 0 0 0 1rem;
  }
  #legend-container .color-div{
    margin: 0 0.5rem;
    width: 20px;
    height: 15px;
  }
  #legend-container .legend-text{
    font-family: Arial, sans-serif;
  }
</style>
`;

class SliderContainer extends HTMLElement {
  constructor() {
    super();

    const shadowRoot = this.attachShadow({ mode: "open" });
    shadowRoot.appendChild(template.content.cloneNode(true));

    this.sliderSet = new Set();

    this.svgContainer = shadowRoot.getElementById("svg-container");
    this.legendContainer = shadowRoot.getElementById("legend-container");
  }

  connectedCallback() {
    if (!this.hasAttribute("radius"))
      console.log("SliderContainer - Radius is required!");

    this.radius = this.getAttribute("radius");

    this.observer = new MutationObserver(this.childListMutation);
    // Watch the Light DOM for child node changes
    this.observer.observe(this, {
      attributes: false,
      childList: true,
      subtree: false,
    });
  }

  disconnectedCallback() {
    this.observer.disconnect();
  }

  childListMutation(mutationsList, observer) {
    mutationsList.forEach((mutation) => {
      if (mutation.type == "childList") {
        //Child added
        if (mutation.addedNodes[0]) {
          const node = mutation.addedNodes[0];
          if (SliderContainer.checkNodeOfType(node, "c-slider")) {
            mutation.target.sliderSet.add(node);
            mutation.target.updateChildrenRadius();
          }

          //Child removed
        } else if (mutation.removedNodes[0]) {
          const node = mutation.removedNodes[0];
          if (SliderContainer.checkNodeOfType(node, "c-slider")) {
            mutation.target.sliderSet.delete(node);
            mutation.target.updateChildrenRadius();
          }
        }
      }
    });
  }

  updateChildrenRadius() {
    let radius = parseInt(this.radius);

    this.svgContainer.innerHTML = "";

    this.sliderSet.forEach((slider) => {
      slider.radius = radius;
      radius += 35;
      slider.createSliderSvg();
      slider.updateContainerWidth();
    });
  }

  static checkNodeOfType(node, name) {
    return node.nodeName.toLowerCase() == name.toLowerCase();
  }
}

window.customElements.define("c-slider-container", SliderContainer);
