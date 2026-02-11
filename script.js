const navToggle = document.getElementById("navToggle")
const nav = document.getElementById("nav")
if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    nav.classList.toggle("open")
    navToggle.classList.toggle("open")
  })
}

document.querySelectorAll(".nav a").forEach(a => {
  a.addEventListener("click", () => {
    nav.classList.remove("open")
    navToggle.classList.remove("open")
  })
})

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener("click", e => {
    const id = link.getAttribute("href")
    if (!id || id === "#") return
    const el = document.querySelector(id)
    if (!el) return
    e.preventDefault()
    el.scrollIntoView({ behavior: "smooth", block: "start" })
  })
})

const form = document.getElementById("reserveForm")
if (form) {
  form.addEventListener("submit", e => {
    e.preventDefault()
    const data = new FormData(form)
    const name = String(data.get("name") || "").trim()
    const phone = String(data.get("phone") || "").trim()
    const guests = String(data.get("guests") || "").trim()
    const date = String(data.get("date") || "").trim()
    const time = String(data.get("time") || "").trim()
    if (!name || !phone || !guests || !date || !time) return
    const loadArr = key => {
      try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : [] } catch { return [] }
    }
    const saveArr = (key, arr) => {
      try { localStorage.setItem(key, JSON.stringify(arr)) } catch {}
    }
    const reservations = loadArr("reservations")
    reservations.push({
      id: Date.now(),
      name,
      phone,
      guests,
      date,
      time,
      createdAt: new Date().toISOString()
    })
    saveArr("reservations", reservations)
    alert(`Request received for ${guests} guests on ${date} at ${time}. Thank you, ${name}!`)
    form.reset()
  })
}
