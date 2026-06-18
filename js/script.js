// Сучасний (Строгий) режим
"use strict"

function initSameProductsSlider() {
  const slider = document.querySelector(".same-products__slider")
  const track = document.querySelector(".same-products__track")
  const dotsWrap = document.querySelector(".same-products__dots")
  if (!slider || !track || !dotsWrap) return

  const slides = Array.from(track.querySelectorAll(".same-products__slide"))
  if (!slides.length) return

  const mobileQuery = window.matchMedia("(width <= 767px)")
  let currentPage = 0
  const totalPages = slides.length
  let resizeTimer = null
  const clampPage = (page) => Math.max(0, Math.min(page, totalPages - 1))

  const initDragScroll = (element) => {
    let isDragging = false
    let startX = 0
    let scrollLeftStart = 0

    element.querySelectorAll("img").forEach((img) => {
      img.draggable = false
    })

    const canScroll = () => element.scrollWidth > element.clientWidth + 1

    const onPointerMove = (event) => {
      if (!isDragging) return
      event.preventDefault()
      element.scrollLeft = scrollLeftStart - (event.clientX - startX)
    }

    const stopDragging = () => {
      if (!isDragging) return
      isDragging = false
      element.classList.remove("is-dragging")
      document.removeEventListener("pointermove", onPointerMove)
      document.removeEventListener("pointerup", stopDragging)
      document.removeEventListener("pointercancel", stopDragging)
    }

    element.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "touch" || event.button !== 0 || !canScroll()) return

      isDragging = true
      element.classList.add("is-dragging")
      startX = event.clientX
      scrollLeftStart = element.scrollLeft

      document.addEventListener("pointermove", onPointerMove)
      document.addEventListener("pointerup", stopDragging)
      document.addEventListener("pointercancel", stopDragging)
      event.preventDefault()
    })

    element.addEventListener("wheel", (event) => {
      if (!canScroll()) return

      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY)
        ? event.deltaX
        : event.deltaY

      if (delta === 0) return

      event.preventDefault()
      element.scrollLeft += delta
    }, { passive: false })
  }

  slides.forEach(initDragScroll)
  initDragScroll(slider)

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

  function getPageWidth() {
    return slider.clientWidth || 1
  }

  function goToPageDesktop(page) {
    currentPage = clampPage(page)
    track.style.transform = `translateX(-${currentPage * 100}%)`
    slides.forEach((slide) => {
      slide.scrollLeft = 0
    })
    updateActiveDot()
  }

  function goToPageMobile(page) {
    currentPage = clampPage(page)
    track.style.transform = "none"
    slider.scrollLeft = currentPage * getPageWidth()
    updateActiveDot()
  }

  function goToPage(page) {
    if (mobileQuery.matches) goToPageMobile(page)
    else goToPageDesktop(page)
  }

  function onSliderScroll() {
    if (!mobileQuery.matches) return

    const page = clampPage(Math.round(slider.scrollLeft / getPageWidth()))
    if (page === currentPage) return

    currentPage = page
    updateActiveDot()
  }

  function recalcSlider() {
    currentPage = clampPage(currentPage)

    if (mobileQuery.matches) {
      track.style.transform = "none"
      goToPageMobile(currentPage)
    } else {
      slider.scrollLeft = 0
      goToPageDesktop(currentPage)
    }
  }

  updateDots()
  recalcSlider()

  slider.addEventListener("scroll", onSliderScroll, { passive: true })

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

