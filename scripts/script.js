document.addEventListener("DOMContentLoaded", () => {
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

  if (animalImages.length > 0) {
    animalImg.src = animalImages[currentAnimalIndex];
  }
  if (kaleidoscopeImages.length > 0) {
    kaleidoscopeImg.src = kaleidoscopeImages[0];
  }

  // Переключение животных (стрелки)
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

  // Вращение калейдоскопа
  if (rotateBtn) {
    rotateBtn.addEventListener("click", () => {
      decorCircle.classList.remove("answer-correct", "answer-wrong");
      // Выбираем случайное изображение
      const randomIndex = Math.floor(Math.random() * kaleidoscopeImages.length);
      selectedKaleidoscopeIndex = randomIndex;
      kaleidoscopeImg.src = kaleidoscopeImages[randomIndex];

      // Перезапуск анимации вращения
      kaleidoscopeImg.classList.remove("rotating");
      // Форсируем reflow для перезапуска анимации
      void kaleidoscopeImg.offsetWidth;
      kaleidoscopeImg.classList.add("rotating");
    });
  }

  // Обработка ответа
  if (answerBtn) {
    answerBtn.addEventListener("click", () => {
      // Удаляем предыдущие классы подсветки с круга
      decorCircle.classList.remove("answer-correct", "answer-wrong");

      // Сравниваем индексы
      if (currentAnimalIndex === selectedKaleidoscopeIndex) {
        decorCircle.classList.add("answer-correct");
      } else {
        decorCircle.classList.add("answer-wrong");
      }
    });
  }
});
