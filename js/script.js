// Сучасний (Строгий) режим
"use strict"

function initSameProductsSlider() {
  const slider = document.querySelector(".same-products__slider")
  const track = document.querySelector(".same-products__track")
  const dotsWrap = document.querySelector(".same-products__dots")
  if (!slider || !track || !dotsWrap) return

  const slides = Array.from(track.querySelectorAll(".same-products__slide"))
  if (!slides.length) return

  let currentPage = 0
  const totalPages = slides.length
  let resizeTimer = null

  const clampPage = (page) => Math.max(0, Math.min(page, totalPages - 1))

  function updateDots() {
    dotsWrap.innerHTML = ""
    for (let i = 0; i < totalPages; i += 1) {
      const dot = document.createElement("button")
      dot.type = "button"
      dot.className = `same-products__dot${i === currentPage ? " same-products__dot--active" : ""}`
      dot.setAttribute("aria-label", `Go to slide ${i + 1}`)
      dot.addEventListener("click", () => goToPage(i))
      dotsWrap.append(dot)
    }
  }

  function updateActiveDot() {
    const dots = dotsWrap.querySelectorAll(".same-products__dot")
    dots.forEach((dot, index) => {
      dot.classList.toggle("same-products__dot--active", index === currentPage)
    })
  }

  function goToPage(page) {
    currentPage = clampPage(page)
    track.style.transform = `translateX(-${currentPage * 100}%)`
    updateActiveDot()
  }

  function recalcSlider() {
    currentPage = clampPage(currentPage)
    goToPage(currentPage)
  }

  updateDots()
  recalcSlider()

  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => recalcSlider(), 150)
  })
}

function initBurgerMenu() {
  const menuButton = document.querySelector(".icon-menu")
  const menu = document.querySelector(".menu")
  const overlay = document.querySelector(".menu-overlay")
  if (!menuButton || !menu) return

  const setMenuOpen = (isOpen) => {
    document.body.classList.toggle("menu-open", isOpen)
    menuButton.setAttribute("aria-expanded", String(isOpen))
    menuButton.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu")
    if (overlay) overlay.setAttribute("aria-hidden", String(!isOpen))
  }

  menuButton.addEventListener("click", () => {
    setMenuOpen(!document.body.classList.contains("menu-open"))
  })

  if (overlay) {
    overlay.addEventListener("click", () => setMenuOpen(false))
  }

  menu.querySelectorAll(".menu__link").forEach((link) => {
    link.addEventListener("click", () => setMenuOpen(false))
  })

  window.addEventListener("resize", () => {
    if (window.innerWidth > 767) setMenuOpen(false)
  })

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenuOpen(false)
  })
}

document.addEventListener("DOMContentLoaded", () => {
  initSameProductsSlider()
  initBurgerMenu()
})

