document.addEventListener("DOMContentLoaded", () => {
  // калейдоскоп
  const kaleidoscopeImg = document.querySelector(".main__kaleidoscope");
  const animalImg = document.querySelector(".decor__animal");
  const leftArrow = document.querySelector(".decor__line--left");
  const rightArrow = document.querySelector(".decor__line--right");
  const rotateBtn = document.querySelector(".button--rotate");
  const answerBtn = document.querySelector(".button--answer");
  const decorCircle = document.querySelector(".decor__circle");

  const kaleidoscopeImages = [
    "img/kaleidoscope-1.png",
    "img/kaleidoscope-2.png",
    "img/kaleidoscope-3.png",
    "img/kaleidoscope-4.png",
    "img/kaleidoscope-5.png",
    "img/kaleidoscope-6.png",
  ];

  const animalImages = [
    "img/image-1.png",
    "img/image-2.png",
    "img/image-3.png",
    "img/image-4.png",
    "img/image-5.png",
    "img/image-6.png",
  ];

  let currentAnimalIndex = 0;
  let selectedKaleidoscopeIndex = 0;
  let isGameComplete = true;

  if (animalImages.length > 0) {
    animalImg.src = animalImages[currentAnimalIndex];
  }
  if (kaleidoscopeImages.length > 0) {
    kaleidoscopeImg.src = kaleidoscopeImages[0];
  }

  if (leftArrow) {
    leftArrow.addEventListener("click", () => {
      currentAnimalIndex =
        (currentAnimalIndex - 1 + animalImages.length) % animalImages.length;
      animalImg.src = animalImages[currentAnimalIndex];
      decorCircle.classList.remove("answer-correct", "answer-wrong");
    });
  }

  if (rightArrow) {
    rightArrow.addEventListener("click", () => {
      currentAnimalIndex = (currentAnimalIndex + 1) % animalImages.length;
      animalImg.src = animalImages[currentAnimalIndex];
      decorCircle.classList.remove("answer-correct", "answer-wrong");
    });
  }

  if (rotateBtn) {
    rotateBtn.addEventListener("click", () => {
      if (!isGameComplete) return;
      decorCircle.classList.remove("answer-correct", "answer-wrong");
      const randomIndex = Math.floor(Math.random() * kaleidoscopeImages.length);
      selectedKaleidoscopeIndex = randomIndex;
      kaleidoscopeImg.src = kaleidoscopeImages[randomIndex];
      kaleidoscopeImg.classList.remove("rotating");
      void kaleidoscopeImg.offsetWidth;
      kaleidoscopeImg.classList.add("rotating");
      isGameComplete = false
    });
  }

  if (answerBtn) {
    answerBtn.addEventListener("click", () => {
      decorCircle.classList.remove("answer-correct", "answer-wrong");
      if (currentAnimalIndex === selectedKaleidoscopeIndex) {
        decorCircle.classList.add("answer-correct");
        isGameComplete = true;
      } else {
        decorCircle.classList.add("answer-wrong");
         isGameComplete = false;
      }
    });
  }

  // раскраска
  const patternArea = document.querySelector(".pattern-area");
  const playBtn = document.querySelector(".button--play");
  const checkBtn = document.querySelector(".button--check");
  const paletteItems = document.querySelectorAll(".ellipse");
  const hintElement = document.querySelector(".pattern-hint"); // подсказка

  const patternUrls = [
    "img/pattern-2.svg",
    "img/pattern-1.svg",
    "img/pattern-3.svg",
    "img/pattern-4.svg",
  ];

  let currentSvgElement = null;
  let originalColors = new Map(); // эталонные цвета
  let selectedColor = null; // выбранный цвет
  let whitenTimer = null; // таймер на обесцвечивание
  let isCheckEnabled = false; // доступна ли проверка (после обесцвечивания)

  // Функция для показа подсказки
  function showHint(text) {
    if (hintElement) {
      hintElement.textContent = text;
      hintElement.classList.add("has-hint"); // опционально для стилей
    }
  }

  // Функция для скрытия подсказки
  function hideHint() {
    if (hintElement) {
      hintElement.textContent = ""; // очищаем текст, но элемент остаётся
      hintElement.classList.remove("has-hint");
    }
  }

  // Функция для получения всех элементов с fill
  function getAllFillElements(node) {
    let elements = [];
    if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.hasAttribute("fill") || node.style.fill) {
        elements.push(node);
      }
      node.childNodes.forEach((child) => {
        elements = elements.concat(getAllFillElements(child));
      });
    }
    return elements;
  }

  // Сохранить исходные цвета (эталон)
  function saveOriginalColors(svg) {
    originalColors.clear();
    const fillElements = getAllFillElements(svg);
    fillElements.forEach((el) => {
      let fill = el.getAttribute("fill");
      if (!fill && el.style.fill) fill = el.style.fill;
      if (!fill) fill = "#000000";
      if (fill === "none") return;
      originalColors.set(el, fill);
    });
  }

  // Обесцветить узор (все fill = white)
  function whitenPattern() {
    if (!currentSvgElement) return;
    const fillElements = getAllFillElements(currentSvgElement);
    fillElements.forEach((el) => {
      el.setAttribute("fill", "white");
    });
    // После обесцвечивания включаем проверку
    isCheckEnabled = true;
    checkBtn.disabled = false;

    // Подсказка: если цвет не выбран, показываем "Выбери цвет"
    if (!selectedColor) {
      showHint("Выбери цвет");
    } else {
      hideHint();
    }
  }

  // Загрузить узор по URL
  async function loadPattern(url, startTimer = true) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const svgText = await response.text();
      patternArea.innerHTML = svgText;
      currentSvgElement = patternArea.querySelector("svg");
      if (!currentSvgElement) return;

      saveOriginalColors(currentSvgElement);
      patternArea.classList.remove("correct");

      if (whitenTimer) clearTimeout(whitenTimer);
      if (startTimer) {
        isCheckEnabled = false;
        checkBtn.disabled = true;
        whitenTimer = setTimeout(() => {
          whitenPattern();
        }, 5000);
      } else {
        // При первой загрузке проверка не включается, узор остаётся цветным
        isCheckEnabled = false;
        checkBtn.disabled = true;
      }
    } catch (error) {
      console.log("Ошибка загрузки узора:", error);
      patternArea.innerHTML = '<p style="color:red;">Ошибка загрузки узора</p>';
    }
  }

  // Загрузить случайный узор (вызывается по кнопке "ИГРАТЬ")
  function loadRandomPattern() {
    const randomIndex = Math.floor(Math.random() * patternUrls.length);
    loadPattern(patternUrls[randomIndex], true);
    // Показываем подсказку "Запомни цвета узора"
    showHint("Запомни цвета узора");
    selectedColor = null;
    paletteItems.forEach((item) => item.classList.remove("active"));
    patternArea.classList.remove("correct");
    if (whitenTimer) clearTimeout(whitenTimer);
    hideCursor();
  }

  // КАСТОМНЫЙ КУРСОР ДЛЯ БЛОКА pattern-area
  const customCursor = document.createElement("div");
  customCursor.className = "custom-cursor";
  document.body.appendChild(customCursor);

  let cursorSvgElement = null;
  let cursorLoaded = false;

  async function loadCursorSVG() {
    try {
      const response = await fetch("img/brush.svg");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const svgText = await response.text();
      customCursor.innerHTML = svgText;
      cursorSvgElement = customCursor.querySelector("svg");
      cursorLoaded = true;
      customCursor.style.display = "none";
    } catch (error) {
      console.log("Ошибка загрузки курсора:", error);
    }
  }

  // Функция для изменения цвета курсора (только заливка)
  function updateCursorColor(color) {
    if (!cursorSvgElement) return;
    const allElements = cursorSvgElement.querySelectorAll("*");
    allElements.forEach((el) => {
      if (el.hasAttribute("fill")) el.setAttribute("fill", color);
      // stroke не трогаем – он остаётся чёрным
    });
  }

  function showCursorAt(e) {
    if (!cursorLoaded || !cursorSvgElement) return;
    customCursor.style.display = "block";
    customCursor.style.left = e.clientX + "px";
    customCursor.style.top = e.clientY + "px";
    if (selectedColor) {
      updateCursorColor(selectedColor);
    }
  }

  function hideCursor() {
    customCursor.style.display = "none";
  }

  function moveCursor(e) {
    if (customCursor.style.display === "block") {
      customCursor.style.left = e.clientX + "px";
      customCursor.style.top = e.clientY + "px";
    }
  }

  if (patternArea) {
    patternArea.addEventListener("mouseenter", showCursorAt);
    patternArea.addEventListener("mousemove", moveCursor);
    patternArea.addEventListener("mouseleave", hideCursor);
  } else {
    console.log("курсор не работает");
  }

  // Обработчик клика по цвету палитры
  function handlePaletteClick(e) {
    const target = e.currentTarget;
    selectedColor = target.getAttribute("data-color");
    paletteItems.forEach((item) => item.classList.remove("active"));
    target.classList.add("active");

    // Если была подсказка "Выбери цвет" – меняем её
    if (hintElement && hintElement.textContent === "Выбери цвет") {
      showHint("Раскрась узор");
    }

    if (
      cursorLoaded &&
      cursorSvgElement &&
      customCursor.style.display === "block"
    ) {
      updateCursorColor(selectedColor);
    }
  }

  paletteItems.forEach((item) => {
    item.addEventListener("click", handlePaletteClick);
  });

  // Обработка клика по элементу узора (закрашивание)
  function handlePatternClick(e) {
    if (!isCheckEnabled) return;
    let target = e.target;
    while (
      target &&
      target !== currentSvgElement &&
      !target.hasAttribute("fill") &&
      !target.style.fill
    ) {
      target = target.parentNode;
    }
    if (!target || target === currentSvgElement) return;
    if (selectedColor) {
      target.setAttribute("fill", selectedColor);
      patternArea.classList.remove("correct");
    }
  }

  // Мигание красным
  function blinkRed(element, currentColor) {
    let blinkCount = 0;
    const interval = setInterval(() => {
      if (blinkCount >= 2) {
        clearInterval(interval);
        element.setAttribute("fill", currentColor);
        return;
      }
      const fillNow = element.getAttribute("fill");
      if (fillNow === "red") {
        element.setAttribute("fill", currentColor);
        blinkCount++;
      } else {
        element.setAttribute("fill", "red");
      }
    }, 500);
  }

  // Проверка раскраски
  function checkColoring() {
    if (!isCheckEnabled || !currentSvgElement) return;
    const fillElements = getAllFillElements(currentSvgElement);
    let allCorrect = true;

    fillElements.forEach((el) => {
      const currentFill = el.getAttribute("fill");
      const originalFill = originalColors.get(el);
      if (originalFill === undefined) return;
      if (currentFill !== originalFill) {
        allCorrect = false;
        blinkRed(el, currentFill);
      }
    });

    if (allCorrect) {
      patternArea.classList.add("correct");
      showHint("Верный ответ");
    } else {
      patternArea.classList.remove("correct");
    }
  }

  patternArea.addEventListener("click", handlePatternClick);

  // Кнопка "ИГРАТЬ"
  if (playBtn) {
    playBtn.addEventListener("click", () => {
      loadRandomPattern();
      selectedColor = null;
      paletteItems.forEach((item) => item.classList.remove("active"));
      patternArea.classList.remove("correct");
      if (whitenTimer) clearTimeout(whitenTimer);
      hideCursor();
    });
  }

  // Кнопка "СВЕРИТЬ" – изначально отключена
  if (checkBtn) {
    checkBtn.disabled = true;
    checkBtn.addEventListener("click", checkColoring);
  }

  // Загружаем первый узор при старте (без таймера, проверка отключена)
  loadPattern(patternUrls[0], false);

  // Загружаем SVG курсора
  loadCursorSVG();

  // Изначально подсказка скрыта
  hideHint();

  // колесо
  const wheelImg = document.querySelector(".wheel-area img");
  const spinBtnWheel = document.querySelector(".button--wheel-spin");
  const listenBtnWheel = document.querySelector(".button--wheel-listen");

  // Массив животных для колеса
  const animalsWheel = [
    { name: "Кит", sound: "sounds/whale.mp3" },
    { name: "Слон", sound: "sounds/horse.mp3" },
    { name: "Лошадка", sound: "sounds/elephant.mp3" },
    { name: "Лиса", sound: "sounds/fox.mp3" },
    { name: "Жаба", sound: "sounds/frog.mp3" },
    { name: "Крок", sound: "sounds/crocodile.mp3" },
  ];

  let currentWheelRotation = 0;
  let isWheelSpinning = false;
  let selectedAnimalIndexWheel = null;


  function getSectorCenterAngle(sectorIndex) {
    const sectorSize = 360 / animalsWheel.length;
    const baseAngle = sectorIndex * sectorSize + sectorSize / 2;
    // Сдвигаем на -60°, чтобы начальное положение указателя (180°) было между секторами 2 и 3.
    return (baseAngle - 60 + 360) % 360;
  }

  function spinWheel() {
    if (isWheelSpinning || !wheelImg) return;
    isWheelSpinning = true;
    if (listenBtnWheel) listenBtnWheel.disabled = true;

    const fullTurns = Math.floor(Math.random() * 6) + 5; // 5–10 полных оборотов
    const randomSector = Math.floor(Math.random() * animalsWheel.length);
    const sectorCenter = getSectorCenterAngle(randomSector);

    // Чтобы центр выбранного сектора оказался под указателем (который смотрит на 180°),
    // нужно повернуть колесо на (180 - sectorCenter) градусов.
    // Приводим к диапазону 0–360.
    const targetAngle = (180 - sectorCenter + 360) % 360;

    const targetRotation = fullTurns * 360 + targetAngle;

    wheelImg.style.transition = "transform 3s cubic-bezier(0.2, 0.9, 0.1, 1.0)";
    wheelImg.style.transform = `rotate(${targetRotation}deg)`;

    const onTransitionEnd = () => {
      wheelImg.removeEventListener("transitionend", onTransitionEnd);
      currentWheelRotation = targetRotation % 360;
      wheelImg.style.transition = "";
      selectedAnimalIndexWheel = randomSector;
      isWheelSpinning = false;
      if (listenBtnWheel) listenBtnWheel.disabled = false;
    };
    wheelImg.addEventListener("transitionend", onTransitionEnd);
  }

  function playWheelSound() {
    if (isWheelSpinning) return;
    if (selectedAnimalIndexWheel !== null) {
      const audio = new Audio(animalsWheel[selectedAnimalIndexWheel].sound);
      audio.play();
    } else {
      console.log("Сначала покрутите колесо");
    }
  }

  if (spinBtnWheel) {
    spinBtnWheel.addEventListener("click", spinWheel);
  }
  if (listenBtnWheel) {
    listenBtnWheel.addEventListener("click", playWheelSound);
  }

  // Начальное положение: поворот на 0° (граница между секторами 2 и 3 под указателем)
  if (wheelImg) {
    wheelImg.style.transform = "rotate(0deg)";
  }
});
