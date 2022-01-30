const template = document.createElement("template");
template.innerHTML = `

<style>
.outer{
  width: fit-content;
  height: fit-content;
  display: flex;
}
</style>
<div class="outer">
  <div id="legend-container">
  </div>
  <svg id="svg-container">
  </svg>
</div>
`;

class SliderContainer extends HTMLElement {
  constructor() {
    super();
    console.log("SliderContainer constructor");

    //initiate shadow DOM and append template
    const shadowRoot = this.attachShadow({ mode: "open" });
    shadowRoot.appendChild(template.content.cloneNode(true));

    this.sliderSet = new Set();

    this.svgContainer = shadowRoot.getElementById("svg-container");
    this.legendContainer = shadowRoot.getElementById("legend-container");
  }

  connectedCallback() {
    console.log("SliderContainer connectedCallback");

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
    console.log("SliderContainer disconnectedCallback");
    this.observer.disconnect();
  }

  adoptedCallback() {
    console.log("SliderContainer adoptedCallback");
  }

  attributeChangedCallback() {
    console.log("SliderContainer attributeChangedCallback");
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
    let __radius = parseInt(this.radius);

    this.svgContainer.innerHTML = "";

    this.sliderSet.forEach((slider) => {
      slider.radius = __radius;
      __radius += 35;
      slider.createSliderSvg();
      slider.updateContainerWidth();
    });
  }

  static checkNodeOfType(node, name) {
    return node.nodeName.toLowerCase() == name.toLowerCase();
  }
}

window.customElements.define("c-slider-container", SliderContainer);
