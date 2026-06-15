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
  const headerBody = document.querySelector(".header__body")
  const headerContainer = document.querySelector(".header__container")
  const menuHome = headerBody || headerContainer
  const buttonHome = menuButton ? menuButton.parentElement : null
  if (!menuButton || !menu || !buttonHome) return

  if (overlay && overlay.parentElement !== document.body) {
    document.body.append(overlay)
  }

  let resizeTimer = null
  let isClosing = false
  let buttonPlaceholder = null

  const resetMobileMenuLayout = () => {
    menu.style.removeProperty("height")
    menu.style.removeProperty("max-height")
    menu.style.removeProperty("padding-top")
    menu.style.removeProperty("opacity")
    menu.style.removeProperty("overflow")

    if (overlay) {
      overlay.style.removeProperty("height")
      overlay.style.removeProperty("max-height")
    }
  }

  const syncMenuButtonPosition = () => {
    if (menuButton.parentElement !== document.body) return

    const header = document.querySelector(".header")
    if (!header) return

    const headerRect = header.getBoundingClientRect()
    const btnWidth = menuButton.offsetWidth || 28
    const container = document.querySelector(".header__container")
    const bodyEl = document.querySelector(".header__body")
    const paddingRight = container
      ? parseFloat(getComputedStyle(container).paddingRight)
      : 15
    const paddingTop = bodyEl
      ? parseFloat(getComputedStyle(bodyEl).paddingTop)
      : 12

    menuButton.style.position = "fixed"
    menuButton.style.top = `${headerRect.top + paddingTop}px`
    menuButton.style.left = `${headerRect.right - paddingRight - btnWidth}px`
    menuButton.style.zIndex = "104"
    menuButton.style.margin = "0"
  }

  const floatMenuButton = () => {
    if (menuButton.parentElement === document.body) {
      syncMenuButtonPosition()
      return
    }

    if (!buttonPlaceholder) {
      buttonPlaceholder = document.createComment("icon-menu-placeholder")
      buttonHome.insertBefore(buttonPlaceholder, menuButton)
    }

    document.body.append(menuButton)
    syncMenuButtonPosition()
  }

  const restoreMenuButton = () => {
    if (!buttonPlaceholder || menuButton.parentElement !== document.body) return

    buttonHome.insertBefore(menuButton, buttonPlaceholder)
    buttonPlaceholder.remove()
    buttonPlaceholder = null

    menuButton.style.removeProperty("position")
    menuButton.style.removeProperty("top")
    menuButton.style.removeProperty("left")
    menuButton.style.removeProperty("z-index")
    menuButton.style.removeProperty("margin")
  }

  const placeMenu = () => {
    if (window.innerWidth <= 767) {
      if (menu.parentElement !== document.body) {
        document.body.append(menu)
      }
      return
    }

    document.body.classList.remove("menu-open")
    isClosing = false
    resetMobileMenuLayout()
    restoreMenuButton()

    if (menuHome && menu.parentElement !== menuHome) {
      menuHome.append(menu)
    }
  }

  const updateMobileMenuLayout = () => {
    if (window.innerWidth > 767) return

    const intro = document.querySelector(".intro")
    const header = document.querySelector(".header")
    const headerHeight = header ? header.offsetHeight : 72
    const panelHeight = intro
      ? intro.offsetHeight
      : Math.min(window.innerHeight, headerHeight + 420)

    menu.style.height = `${panelHeight}px`
    menu.style.maxHeight = `${panelHeight}px`
    menu.style.paddingTop = `${Math.max(headerHeight - 32, 32)}px`

    if (overlay) {
      overlay.style.height = `${panelHeight}px`
      overlay.style.maxHeight = `${panelHeight}px`
    }

    syncMenuButtonPosition()
  }

  const openMenu = () => {
    if (isClosing || window.innerWidth > 767) return

    placeMenu()
    floatMenuButton()
    updateMobileMenuLayout()
    requestAnimationFrame(() => {
      document.body.classList.add("menu-open")
      menuButton.setAttribute("aria-expanded", "true")
      menuButton.setAttribute("aria-label", "Close menu")
      if (overlay) overlay.setAttribute("aria-hidden", "false")
      syncMenuButtonPosition()
    })
  }

  const closeMenu = () => {
    if (!document.body.classList.contains("menu-open") || isClosing) return

    isClosing = true
    menuButton.setAttribute("aria-expanded", "false")
    menuButton.setAttribute("aria-label", "Open menu")
    if (overlay) overlay.setAttribute("aria-hidden", "true")

    document.body.classList.remove("menu-open")
    menu.style.maxHeight = "0"
    menu.style.paddingTop = "0"

    if (overlay) {
      overlay.style.maxHeight = "0"
    }

    const onCloseEnd = (event) => {
      if (event.target !== menu) return

      isClosing = false
      resetMobileMenuLayout()
      restoreMenuButton()
      menu.removeEventListener("transitionend", onCloseEnd)
    }

    menu.addEventListener("transitionend", onCloseEnd)
  }

  const setMenuOpen = (isOpen) => {
    if (isOpen) openMenu()
    else closeMenu()
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
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
      placeMenu()

      if (window.innerWidth <= 767 && document.body.classList.contains("menu-open")) {
        updateMobileMenuLayout()
      }
    }, 150)
  })

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenuOpen(false)
  })

  placeMenu()
}

document.addEventListener("DOMContentLoaded", () => {
  initSameProductsSlider()
  initBurgerMenu()
})

