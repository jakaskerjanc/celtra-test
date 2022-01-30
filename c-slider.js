class Slider extends HTMLElement {
  constructor() {
    super();
    console.log("Slider constructor");
  }

  connectedCallback() {
    console.log("Slider connectedCallback");

    if (!Slider.checkNodeOfType(this.parentElement, "c-slider-container")) {
      console.log("c-slider must be used in c-slider-container");
    }

    this.color = this.hasAttribute("color")
      ? this.getAttribute("color")
      : "red";
    this.label = this.hasAttribute("label")
      ? this.getAttribute("label")
      : "no name";
    this.radius = this.hasAttribute("radius")
      ? parseInt(this.getAttribute("radius"))
      : 100;
    this.min = this.hasAttribute("min")
      ? parseInt(this.getAttribute("min"))
      : 1;
    this.max = this.hasAttribute("max")
      ? parseInt(this.getAttribute("max"))
      : 100;
    this.step = this.hasAttribute("step")
      ? parseInt(this.getAttribute("step"))
      : 1;
    this.value = this.hasAttribute("value")
      ? parseInt(this.getAttribute("value"))
      : 0;

    this.parentElement.legendContainer.appendChild(this.createLegend());
  }

  disconnectedCallback() {
    console.log("Slider disconnectedCallback");

    this.group = null;
  }

  adoptedCallback() {
    console.log("Slider adoptedCallback");
  }

  attributeChangedCallback() {
    console.log("Slider attributeChangedCallback");
  }

  static checkNodeOfType(node, name) {
    return node.nodeName.toLowerCase() == name.toLowerCase();
  }

  createSliderSvg() {
    this.calcAngle();
    this.calcOffset();

    let dashCircle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    dashCircle.setAttribute("r", this.radius);
    dashCircle.setAttribute("fill", "none");
    dashCircle.setAttribute("stroke", "grey");
    dashCircle.setAttribute("stroke-width", "20");
    dashCircle.setAttribute("stroke-dasharray", "5");
    dashCircle.setAttribute("cx", "50%");
    dashCircle.setAttribute("cy", "50%");

    let eventCircle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    eventCircle.setAttribute("r", this.radius);
    eventCircle.setAttribute("fill", "none");
    eventCircle.setAttribute("stroke", "rgba(0,0,0,0)");
    eventCircle.setAttribute("stroke-width", "20");
    eventCircle.setAttribute("cx", "50%");
    eventCircle.setAttribute("cy", "50%");

    this.colorCircle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    this.colorCircle.setAttribute("r", this.radius);
    this.colorCircle.setAttribute("fill", "none");
    this.colorCircle.setAttribute("stroke", this.color);
    this.colorCircle.setAttribute("stroke-width", "20");
    this.colorCircle.setAttribute("opacity", "0.7");
    this.colorCircle.setAttribute("cx", "50%");
    this.colorCircle.setAttribute("cy", "50%");
    this.colorCircle.setAttribute("transform", "rotate(-90)");
    this.colorCircle.setAttribute("transform-origin", "50% 50%");

    this.colorCircle.setAttribute(
      "stroke-dasharray",
      `${this.offset} ${this.radius * 3.141 * 2}`
    );

    this.btnCircle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    this.btnCircle.setAttribute("r", "15");
    this.btnCircle.setAttribute("fill", "white");
    this.btnCircle.setAttribute("stroke", "grey");
    this.btnCircle.setAttribute("stroke-width", "1");
    this.btnCircle.setAttribute("transform", `rotate(${this.angle})`);
    this.btnCircle.setAttribute("transform-origin", "50% 50%");
    this.btnCircle.style.cx = `50%`;
    this.btnCircle.style.cy = `calc(50% - ${this.radius}px)`;

    this.group = document.createElementNS("http://www.w3.org/2000/svg", "g");

    this.group.appendChild(dashCircle);
    this.group.appendChild(eventCircle);
    this.group.appendChild(this.colorCircle);
    this.group.appendChild(this.btnCircle);

    this.group.addEventListener("mousedown", this.clickEvent.bind(this));
    document.addEventListener("mouseup", this.clickEventUp.bind(this));
    document.addEventListener("mousemove", this.clickEventMove.bind(this));

    this.parentElement.shadowRoot
      .getElementById("svg-container")
      .appendChild(this.group);
  }

  updateContainerWidth() {
    let sliderWidth = 2 * this.radius + 50;
    this.parentElement.svgContainer.setAttribute("height", sliderWidth);
    this.parentElement.svgContainer.setAttribute("width", sliderWidth);
  }

  clickEventMove(event) {
    if (this.dragging) this.clickEvent(event);
  }

  clickEventUp(event) {
    this.dragging = false;
  }

  clickEvent(event) {
    this.dragging = true;

    event.preventDefault();

    let x = event.clientX;
    let y = event.clientY;

    let dimensions = this.parentElement.svgContainer.getBoundingClientRect();
    let cx = dimensions.left + dimensions.width / 2;
    let cy = dimensions.top + dimensions.height / 2;

    let dx = x - cx;
    let dy = y - cy;
    // returns angle in degrees. + 90 is added to rotate coordinate system
    // so 0deg angle is at the top of the circle.
    let angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    if (angle < 0) {
      angle += 360;
    }

    this.angle = angle;
    this.value = Math.round(this.min + (this.max - this.min) * (angle / 360));
    this.setAttribute("value", this.value);
    this.btnCircle.setAttribute("transform", `rotate(${this.angle})`);
    this.calcOffset();
    this.colorCircle.setAttribute(
      "stroke-dasharray",
      `${this.offset} ${this.radius * 3.141 * 2}`
    );
    this.legendNumberElement.innerText = this.value;
  }

  calcOffset() {
    this.offset =
      this.radius * 3.141 * 2 * (this.value / this.max - this.min + 1);
  }
  calcAngle() {
    this.angle = 360 * (this.value / this.max - this.min + 1);
  }

  createLegend() {
    let div = document.createElement("div");
    let h = document.createElement("h3");
    let color = document.createElement("div");
    let text = document.createElement("span");
    div.appendChild(h);
    div.appendChild(color);
    div.appendChild(text);
    h.innerText = this.value;
    text.innerText = this.label;
    div.style.display = "flex";
    div.style.alignItems = "center";

    color.style.backgroundColor = this.color;
    color.style.width = "20px";
    color.style.height = "20px";

    this.legendNumberElement = h;

    return div;
  }
}

window.customElements.define("c-slider", Slider);
