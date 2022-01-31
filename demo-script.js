let sliderContainer = document.getElementById("slider-container");

window.onload = () => {
  inputEvent();
};

function addSlider() {
  let min = 1;
  let max = 100;
  let slider = document.createElement("c-slider");
  slider.setAttribute("min", min);
  slider.setAttribute("max", max);
  slider.setAttribute("step", "1");
  slider.setAttribute("color", getRandomColor());
  slider.setAttribute("value", Math.round(Math.random() * max - min));
  slider.setAttribute("label", "Random Slider");

  sliderContainer.appendChild(slider);
}

function removeSlider() {
  sliderContainer.removeChild(sliderContainer.lastElementChild);
}

function getRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function inputEvent() {
  let slider = document.getElementById("slider1");
  let input = document.getElementById("input");

  input.setAttribute("value", slider.getAttribute("value"));
  input.addEventListener("change", (e) => {
    slider.setAttribute("value", e.target.value);
  });

  const config = { attributes: true, childList: false, subtree: false };

  // Callback function to execute when mutations are observed
  const callback = function (mutationsList, observer) {
    // Use traditional 'for loops' for IE 11
    for (const mutation of mutationsList) {
      if (mutation.type === "attributes") {
        input.setAttribute("value", slider.getAttribute("value"));
      }
    }
  };

  // Create an observer instance linked to the callback function
  const observer = new MutationObserver(callback);

  // Start observing the target node for configured mutations
  observer.observe(slider, config);
}
