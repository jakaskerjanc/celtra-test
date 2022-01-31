class Slider extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    //Check if c-slider-container is parent
    if (!Slider.checkNodeOfType(this.parentElement, "c-slider-container")) {
      console.log("c-slider must be used in c-slider-container");
    }

    //Get attributes
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
      : this.min;

    //Check if we get valid numbers
    if (this.max < this.min) {
      console.log(
        "Invalid min and max values: max smaller than min, reset to default"
      );
      this.max = 100;
      this.min = 1;
      this.setAttribute("min", this.min);
      this.setAttribute("max", this.max);
    }
    if (this.min < 0) {
      this.min = 0;
      this.setAttribute("min", this.min);
    }
    if (this.value < this.min) {
      this.value = this.min;
      this.setAttribute("value", this.value);
    }
    if (this.value > this.max) {
      this.value = this.max;
      this.setAttribute("value", this.value);
    }

    //Check if starting value matches step
    let ceiledValue = Math.ceil(this.value / this.step) * this.step;
    if (this.value != ceiledValue) {
      this.value = ceiledValue;
      this.setAttribute("value", ceiledValue);
    }

    this.valueRange = this.max - this.min;

    //We need to save parentElement for use in disconnectedCallback
    this.parent = this.parentElement;

    this.parentElement.legendContainer.appendChild(this.createLegend());
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name != "value" || oldValue == null || oldValue == newValue) return;

    let newValueInt = parseInt(newValue);

    if (newValueInt > this.max) {
      this.setAttribute("value", this.max);
      return;
    }
    if (newValueInt < this.min) {
      this.setAttribute("value", this.min);
      return;
    }
    //Check if value matches step
    let ceiledValue = Math.ceil(newValueInt / this.step) * this.step;
    if (newValueInt != ceiledValue) {
      this.setAttribute("value", ceiledValue);
      return;
    }

    this.value = newValueInt;

    if (!this.colorCircle || !this.btnCircle || !this.legendElementNumber)
      return;

    this.updateColorCircle();
    this.updateBtnCircle();

    this.legendElementNumber.innerText = "$" + this.value;
  }

  static get observedAttributes() {
    return ["value"];
  }

  disconnectedCallback() {
    //Remove legend if slider is removed
    this.parent.legendContainer.removeChild(this.legendElement);
  }

  static checkNodeOfType(node, name) {
    return node.nodeName.toLowerCase() == name.toLowerCase();
  }

  createDashCircle() {
    this.dashCircle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    this.dashCircle.setAttribute("r", this.radius);
    this.dashCircle.setAttribute("fill", "none");
    this.dashCircle.setAttribute("stroke", "grey");
    this.dashCircle.setAttribute("stroke-width", "20");
    this.dashCircle.setAttribute("cx", "50%");
    this.dashCircle.setAttribute("cy", "50%");
    this.dashCircle.setAttribute("transform", "rotate(-90)");
    this.dashCircle.setAttribute("transform-origin", "50% 50%");

    let dashSpacing =
      (this.radius * 3.14 * 2) / (this.valueRange / this.step) - 2;

    //Limit dash spacing
    dashSpacing = dashSpacing < 3 ? 3 : dashSpacing;
    this.dashCircle.setAttribute("stroke-dasharray", dashSpacing + " 2");
  }

  //Transparent Circle only used to get click event
  //If we click between tick event would not register
  createEventCircle() {
    this.eventCircle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    this.eventCircle.setAttribute("r", this.radius);
    this.eventCircle.setAttribute("fill", "none");
    this.eventCircle.setAttribute("stroke", "rgba(0,0,0,0)");
    this.eventCircle.setAttribute("stroke-width", "20");
    this.eventCircle.setAttribute("cx", "50%");
    this.eventCircle.setAttribute("cy", "50%");
  }

  createColorCircle() {
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
    //Rotate so we start at the top
    this.colorCircle.setAttribute("transform", "rotate(-90)");
    //Rotate around center of <svg>
    this.colorCircle.setAttribute("transform-origin", "50% 50%");

    this.updateColorCircle();
  }

  createBtnCircle() {
    this.btnCircle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    this.btnCircle.setAttribute("r", "15");
    this.btnCircle.setAttribute("fill", "white");
    this.btnCircle.setAttribute("stroke", "grey");
    this.btnCircle.setAttribute("stroke-width", "1");
    //Change rotation center to middle of <svg>
    this.btnCircle.setAttribute("transform-origin", "50% 50%");
    //Center button to middle of <svg>
    this.btnCircle.style.cx = `50%`;
    this.btnCircle.style.cy = `calc(50% - ${this.radius}px)`;

    this.updateBtnCircle();
  }

  createSliderSvg() {
    this.createDashCircle();
    this.createEventCircle();
    this.createColorCircle();
    this.createBtnCircle();

    this.group = document.createElementNS("http://www.w3.org/2000/svg", "g");

    this.group.appendChild(this.dashCircle);
    this.group.appendChild(this.eventCircle);
    this.group.appendChild(this.colorCircle);
    this.group.appendChild(this.btnCircle);

    this.group.addEventListener("mousedown", this.clickEvent.bind(this));
    this.group.addEventListener("touchstart", this.clickEvent.bind(this));
    this.group.addEventListener("touchmove", this.clickEvent.bind(this));

    document.addEventListener("mouseup", this.clickEventUp.bind(this));
    document.addEventListener("touchend", this.clickEventUp.bind(this));
    document.addEventListener("mousemove", this.clickEventMove.bind(this));

    this.parentElement.shadowRoot
      .getElementById("svg-container")
      .appendChild(this.group);
  }

  //Calculate stroke-dasharray for colored circle
  updateColorCircle() {
    let offset =
      this.radius * 3.141 * 2 * ((this.value - this.min) / this.valueRange);

    this.colorCircle.setAttribute(
      "stroke-dasharray",
      `${offset} ${this.radius * 3.141 * 2}`
    );
  }

  //Calculate angle for button rotation
  updateBtnCircle() {
    let angle = 360 * ((this.value - this.min) / this.valueRange);
    this.btnCircle.setAttribute("transform", `rotate(${angle})`);
  }

  //Expand container to match slider size
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

    //Mouse click vs touch
    let eventX = event.clientX ? event.clientX : event.touches[0].clientX;
    let eventY = event.clientY ? event.clientY : event.touches[0].clientY;

    //Get <svg> center from top corner and size
    let dimensions = this.parentElement.svgContainer.getBoundingClientRect();
    let centerX = dimensions.left + dimensions.width / 2;
    let centerY = dimensions.top + dimensions.height / 2;

    let distX = eventX - centerX;
    let distY = eventY - centerY;

    let angle = (Math.atan2(distY, distX) * 180) / Math.PI + 90;
    if (angle < 0) {
      angle += 360;
    }

    let value;

    //Snapping to min, max value if we are close to 0,
    //so we don't get jumping from min to max
    if (angle < 5) {
      value = this.min;
      angle = 0;
    } else if (angle > 355) {
      value = this.max;
      angle = 360;
    } else {
      //Calculate new value from angle
      value = Math.round(this.min + this.valueRange * (angle / 360));
      //Calculate value for step
      value = Math.round(value / this.step) * this.step;
    }

    this.setAttribute("value", value);
  }

  createLegend() {
    let div = document.createElement("div");
    let h = document.createElement("h1");
    let color = document.createElement("div");
    let text = document.createElement("span");
    div.appendChild(h);
    div.appendChild(color);
    div.appendChild(text);
    h.innerText = "$" + this.value;
    text.innerText = this.label;

    color.classList.add("color-div");
    text.classList.add("legend-text");

    color.style.backgroundColor = this.color;

    //Save element for updating number and to remove on disconnect
    this.legendElementNumber = h;
    this.legendElement = div;

    return div;
  }
}

window.customElements.define("c-slider", Slider);
