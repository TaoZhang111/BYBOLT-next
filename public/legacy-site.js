document.documentElement.classList.add("js");

const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const rfqForm = document.querySelector("[data-rfq-form]");
const fastenerCanvas = document.querySelector("[data-fastener-canvas]");
const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

function setHeaderState() {
  if (header) {
    header.classList.toggle("is-scrolled", window.scrollY > 18);
  }
}

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

if (nav && navToggle) {
  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  });

  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      nav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Open menu");
    }
  });
}

function initRevealAnimations() {
  const revealItems = [...document.querySelectorAll("[data-reveal]")];
  if (!revealItems.length) {
    return;
  }

  if (reduceMotionQuery.matches || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px" }
  );

  revealItems.forEach((item) => observer.observe(item));
}

function formatFileSize(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function createInquiryNumber() {
  const now = new Date();
  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0")
  ].join("");
  const random = String(Math.floor(1000 + Math.random() * 9000));
  return `BYB-${date}-${random}`;
}

function initRfqForm() {
  if (!rfqForm) {
    return;
  }

  const formStatus = rfqForm.querySelector("[data-form-status]");
  const submitButton = rfqForm.querySelector("[data-submit-button]");
  const submitLabel = rfqForm.querySelector("[data-submit-label]");
  const successPanel = document.querySelector("[data-rfq-success]");
  const newRfqButton = document.querySelector("[data-new-rfq]");
  const productSelect = rfqForm.querySelector("[data-product-select]");
  const productOther = rfqForm.querySelector("[data-product-other]");
  const productOtherInput = productOther?.querySelector("input");
  const testingOtherToggle = rfqForm.querySelector("[data-testing-other-toggle]");
  const testingOther = rfqForm.querySelector("[data-testing-other]");
  const fileInput = rfqForm.querySelector("[data-file-input]");
  const uploadZone = rfqForm.querySelector("[data-upload-zone]");
  const uploadError = rfqForm.querySelector("[data-upload-error]");
  const fileList = rfqForm.querySelector("[data-file-list]");
  const acceptedExtensions = new Set(["pdf", "dwg", "dxf", "step", "stp", "jpg", "jpeg", "png"]);
  const maxFileSize = 10 * 1024 * 1024;
  let selectedFiles = [];

  function getFieldError(field) {
    return rfqForm.querySelector(`[data-error-for="${field.name}"]`);
  }

  function validationMessage(field) {
    if (field.validity.valueMissing) {
      return "Please complete this required field.";
    }
    if (field.validity.typeMismatch && field.type === "email") {
      return "Enter a valid business email address.";
    }
    if (field.validity.rangeUnderflow) {
      return "Quantity must be at least 1.";
    }
    return "Check this value and try again.";
  }

  function validateField(field) {
    if (!field.name || field.disabled || field.type === "checkbox" || field.type === "file") {
      return true;
    }

    const isValid = field.checkValidity();
    const error = getFieldError(field);
    field.setAttribute("aria-invalid", String(!isValid));
    if (error) {
      error.textContent = isValid ? "" : validationMessage(field);
    }
    return isValid;
  }

  function updateProductOther() {
    if (!productSelect || !productOther || !productOtherInput) {
      return;
    }
    const isOther = productSelect.value === "Other";
    productOther.hidden = !isOther;
    productOtherInput.required = isOther;
    if (!isOther) {
      productOtherInput.value = "";
      productOtherInput.removeAttribute("aria-invalid");
      const error = getFieldError(productOtherInput);
      if (error) {
        error.textContent = "";
      }
    }
  }

  function updateTestingOther() {
    if (!testingOtherToggle || !testingOther) {
      return;
    }
    testingOther.hidden = !testingOtherToggle.checked;
    if (!testingOtherToggle.checked) {
      const input = testingOther.querySelector("input");
      if (input) {
        input.value = "";
      }
    }
  }

  function syncFileInput() {
    if (!fileInput || typeof DataTransfer === "undefined") {
      return;
    }

    const transfer = new DataTransfer();
    selectedFiles.forEach((file) => transfer.items.add(file));
    fileInput.files = transfer.files;
  }

  function renderFiles() {
    if (!fileList) {
      return;
    }

    fileList.replaceChildren();
    selectedFiles.forEach((file, index) => {
      const item = document.createElement("li");
      const extension = file.name.split(".").pop()?.toUpperCase() || "FILE";
      const type = document.createElement("span");
      const meta = document.createElement("span");
      const name = document.createElement("strong");
      const size = document.createElement("small");
      const remove = document.createElement("button");

      type.className = "file-type";
      type.textContent = extension;
      meta.className = "file-meta";
      name.textContent = file.name;
      size.textContent = `${formatFileSize(file.size)} · Ready`;
      meta.append(name, size);
      remove.className = "file-remove";
      remove.type = "button";
      remove.textContent = "×";
      remove.setAttribute("aria-label", `Remove ${file.name}`);
      remove.addEventListener("click", () => {
        selectedFiles.splice(index, 1);
        syncFileInput();
        renderFiles();
      });
      item.append(type, meta, remove);
      fileList.append(item);
    });
  }

  function addFiles(files) {
    if (!uploadError) {
      return;
    }

    const errors = [];
    [...files].forEach((file) => {
      const extension = file.name.split(".").pop()?.toLowerCase() || "";
      if (!acceptedExtensions.has(extension)) {
        errors.push(`${file.name}: unsupported format.`);
        return;
      }
      if (file.size > maxFileSize) {
        errors.push(`${file.name}: file exceeds 10 MB.`);
        return;
      }

      const isDuplicate = selectedFiles.some(
        (selected) =>
          selected.name === file.name &&
          selected.size === file.size &&
          selected.lastModified === file.lastModified
      );
      if (!isDuplicate) {
        selectedFiles.push(file);
      }
    });

    uploadError.textContent = errors.join(" ");
    syncFileInput();
    renderFiles();
  }

  rfqForm.querySelectorAll("input, select, textarea").forEach((field) => {
    field.addEventListener("blur", () => validateField(field));
    field.addEventListener("input", () => {
      if (field.getAttribute("aria-invalid") === "true") {
        validateField(field);
      }
    });
  });

  if (productSelect) {
    const requestedProduct = new URLSearchParams(window.location.search).get("product");
    if (requestedProduct && [...productSelect.options].some((option) => option.value === requestedProduct)) {
      productSelect.value = requestedProduct;
    } else if (requestedProduct && productOtherInput) {
      productSelect.value = "Other";
    }
    productSelect.addEventListener("change", updateProductOther);
    updateProductOther();
    if (requestedProduct && productSelect.value === "Other" && productOtherInput) {
      productOtherInput.value = requestedProduct;
    }
  }

  if (testingOtherToggle) {
    testingOtherToggle.addEventListener("change", updateTestingOther);
    updateTestingOther();
  }

  if (fileInput && uploadZone) {
    fileInput.addEventListener("change", () => addFiles(fileInput.files));
    uploadZone.addEventListener("click", (event) => {
      if (event.target !== fileInput) {
        fileInput.click();
      }
    });
    uploadZone.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        fileInput.click();
      }
    });

    ["dragenter", "dragover"].forEach((eventName) => {
      uploadZone.addEventListener(eventName, (event) => {
        event.preventDefault();
        uploadZone.classList.add("is-dragging");
      });
    });

    ["dragleave", "drop"].forEach((eventName) => {
      uploadZone.addEventListener(eventName, (event) => {
        event.preventDefault();
        uploadZone.classList.remove("is-dragging");
      });
    });

    uploadZone.addEventListener("drop", (event) => addFiles(event.dataTransfer.files));
  }

  rfqForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const fields = [...rfqForm.querySelectorAll("input, select, textarea")];
    const invalidFields = fields.filter((field) => !validateField(field));

    if (invalidFields.length) {
      formStatus.textContent = "Please correct the highlighted fields before submitting.";
      invalidFields[0].focus();
      return;
    }

    formStatus.textContent = "";
    submitButton.disabled = true;
    submitLabel.textContent = "Submitting...";

    window.setTimeout(() => {
      const email = rfqForm.elements.email.value;
      document.querySelector("[data-rfq-number]").textContent = createInquiryNumber();
      document.querySelector("[data-rfq-email]").textContent = email;
      rfqForm.hidden = true;
      successPanel.hidden = false;
      submitButton.disabled = false;
      submitLabel.textContent = "Submit RFQ";
      successPanel.focus?.();
      successPanel.scrollIntoView({ behavior: reduceMotionQuery.matches ? "auto" : "smooth", block: "start" });
    }, 650);
  });

  if (newRfqButton && successPanel) {
    newRfqButton.addEventListener("click", () => {
      rfqForm.reset();
      selectedFiles = [];
      renderFiles();
      if (uploadError) {
        uploadError.textContent = "";
      }
      rfqForm.querySelectorAll('[aria-invalid="true"]').forEach((field) => field.removeAttribute("aria-invalid"));
      rfqForm.querySelectorAll("[data-error-for]").forEach((error) => {
        error.textContent = "";
      });
      updateProductOther();
      updateTestingOther();
      successPanel.hidden = true;
      rfqForm.hidden = false;
      rfqForm.scrollIntoView({ behavior: reduceMotionQuery.matches ? "auto" : "smooth", block: "start" });
    });
  }
}

function initMaterialCarousel() {
  const carousel = document.querySelector("[data-material-carousel]");
  if (!carousel) {
    return;
  }

  const slides = [...carousel.querySelectorAll("[data-material-slide]")];
  const previousButton = carousel.querySelector("[data-material-prev]");
  const nextButton = carousel.querySelector("[data-material-next]");
  const currentLabel = carousel.querySelector("[data-material-current]");
  const progress = carousel.querySelector("[data-material-progress]");
  let currentIndex = 0;

  function showSlide(index) {
    currentIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === currentIndex;
      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
    });
    currentLabel.textContent = String(currentIndex + 1).padStart(2, "0");
    progress.style.width = `${((currentIndex + 1) / slides.length) * 100}%`;
  }

  previousButton.addEventListener("click", () => showSlide(currentIndex - 1));
  nextButton.addEventListener("click", () => showSlide(currentIndex + 1));
  carousel.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      showSlide(currentIndex - 1);
    }
    if (event.key === "ArrowRight") {
      showSlide(currentIndex + 1);
    }
  });
  showSlide(0);
}

function initIndustryAccordion() {
  const accordion = document.querySelector("[data-industry-accordion]");
  if (!accordion) {
    return;
  }

  const panels = [...accordion.querySelectorAll("[data-industry-panel]")];
  function activatePanel(activePanel) {
    panels.forEach((panel) => panel.classList.toggle("is-active", panel === activePanel));
  }

  panels.forEach((panel) => {
    panel.addEventListener("mouseenter", () => activatePanel(panel));
    panel.addEventListener("focusin", () => activatePanel(panel));
    panel.addEventListener("click", (event) => {
      if (!event.target.closest("a")) {
        activatePanel(panel);
      }
    });
  });
}

function initProductCarousels() {
  document.querySelectorAll("[data-product-carousel]").forEach((carousel) => {
    const track = carousel.querySelector("[data-product-track]");
    const previous = carousel.querySelector("[data-product-prev]");
    const next = carousel.querySelector("[data-product-next]");
    if (!track || !previous || !next) {
      return;
    }

    function move(direction) {
      const card = track.querySelector(".related-product-card");
      const distance = (card?.getBoundingClientRect().width || track.clientWidth * 0.82) + 12;
      track.scrollBy({ left: distance * direction, behavior: reduceMotionQuery.matches ? "auto" : "smooth" });
    }

    previous.addEventListener("click", () => move(-1));
    next.addEventListener("click", () => move(1));
  });
}

let tasteMotionContext = null;

function initTasteMotion() {
  if (tasteMotionContext || reduceMotionQuery.matches || !window.gsap || !window.ScrollTrigger) {
    return;
  }

  window.gsap.registerPlugin(window.ScrollTrigger);
  document.documentElement.classList.add("gsap-enabled");

  tasteMotionContext = window.gsap.context(() => {
    window.gsap.utils.toArray("[data-scale-media]").forEach((media) => {
      window.gsap
        .timeline({
          scrollTrigger: {
            trigger: media,
            start: "top 94%",
            end: "bottom 8%",
            scrub: 1.1
          }
        })
        .fromTo(media, { scale: 0.86, opacity: 0.3 }, { scale: 1, opacity: 1, duration: 0.46, ease: "none" })
        .to(media, { scale: 0.96, opacity: 0.22, duration: 0.54, ease: "none" });
    });

    window.gsap.utils.toArray("[data-scrub-copy]").forEach((copy) => {
      if (!copy.querySelector(".scrub-word")) {
        const words = copy.textContent.trim().split(/\s+/);
        copy.replaceChildren();
        words.forEach((word, index) => {
          const span = document.createElement("span");
          span.className = "scrub-word";
          span.textContent = word;
          copy.append(span);
          if (index < words.length - 1) {
            copy.append(document.createTextNode(" "));
          }
        });
      }

      window.gsap.fromTo(
        copy.querySelectorAll(".scrub-word"),
        { opacity: 0.65 },
        {
          opacity: 1,
          stagger: 0.08,
          ease: "none",
          scrollTrigger: {
            trigger: copy,
            start: "top 84%",
            end: "bottom 48%",
            scrub: 0.7
          }
        }
      );
    });

    const productMotion = window.gsap.matchMedia();
    productMotion.add("(min-width: 821px)", () => {
      document.querySelectorAll("[data-spec-pin]").forEach((panel) => {
        const section = panel.closest(".technical-specs");
        if (!section) {
          return;
        }
        window.ScrollTrigger.create({
          trigger: section,
          start: "top top+=104",
          end: "bottom bottom-=100",
          pin: panel,
          pinSpacing: false,
          anticipatePin: 1
        });
      });

      document.querySelectorAll(".technical-hero-media, .category-hero figure").forEach((media) => {
        window.gsap.fromTo(
          media.querySelector("img"),
          { scale: 1.04, yPercent: -2 },
          {
            scale: 1.12,
            yPercent: 4,
            ease: "none",
            scrollTrigger: { trigger: media, start: "top bottom", end: "bottom top", scrub: 1 }
          }
        );
      });
    });

    const processJourney = document.querySelector("[data-process-journey]");
    if (!processJourney) {
      return;
    }

    const processSteps = window.gsap.utils.toArray("[data-process-step]", processJourney);
    const processImages = window.gsap.utils.toArray("[data-process-image]", processJourney);
    const activateProcessStep = (index) => {
      processImages.forEach((image, imageIndex) => {
        const isActive = imageIndex === index;
        image.classList.toggle("is-active", isActive);
        image.setAttribute("aria-hidden", String(!isActive));
      });
      processSteps.forEach((step, stepIndex) => step.classList.toggle("is-active", stepIndex === index));
    };

    activateProcessStep(0);

    processSteps.forEach((step, index) => {
      window.ScrollTrigger.create({
        trigger: step,
        start: "top 58%",
        end: "bottom 42%",
        onEnter: () => activateProcessStep(index),
        onEnterBack: () => activateProcessStep(index)
      });

    });

  });
}

function stopTasteMotion() {
  if (tasteMotionContext) {
    tasteMotionContext.revert();
    tasteMotionContext = null;
  }
  document.documentElement.classList.remove("gsap-enabled");
}

initRevealAnimations();
initRfqForm();
initMaterialCarousel();
initIndustryAccordion();
initProductCarousels();
initTasteMotion();

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(message || "Unable to compile shader");
  }

  return shader;
}

function createProgram(gl, vertexSource, fragmentSource) {
  const program = gl.createProgram();
  gl.attachShader(program, createShader(gl, gl.VERTEX_SHADER, vertexSource));
  gl.attachShader(program, createShader(gl, gl.FRAGMENT_SHADER, fragmentSource));
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(message || "Unable to link shader program");
  }

  return program;
}

function normalize(value) {
  const length = Math.hypot(value[0], value[1], value[2]) || 1;
  return [value[0] / length, value[1] / length, value[2] / length];
}

function cross(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0]
  ];
}

function subtract(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function addFace(mesh, a, b, c, material) {
  const normal = normalize(cross(subtract(b, a), subtract(c, a)));
  for (const point of [a, b, c]) {
    mesh.positions.push(point[0], point[1], point[2]);
    mesh.normals.push(normal[0], normal[1], normal[2]);
    mesh.materials.push(material);
  }
}

function addQuad(mesh, a, b, c, d, material) {
  addFace(mesh, a, b, c, material);
  addFace(mesh, a, c, d, material);
}

function addRingSurface(mesh, rings, sides, material) {
  for (let i = 0; i < rings.length - 1; i += 1) {
    for (let j = 0; j < sides; j += 1) {
      const next = (j + 1) % sides;
      addQuad(mesh, rings[i][j], rings[i + 1][j], rings[i + 1][next], rings[i][next], material);
    }
  }
}

function ringX(x, radius, sides, phase = 0) {
  const points = [];
  for (let i = 0; i < sides; i += 1) {
    const angle = phase + (i / sides) * Math.PI * 2;
    points.push([x, Math.cos(angle) * radius, Math.sin(angle) * radius]);
  }
  return points;
}

function addCap(mesh, ring, x, material, flip = false) {
  const center = [x, 0, 0];
  for (let i = 0; i < ring.length; i += 1) {
    const next = (i + 1) % ring.length;
    if (flip) {
      addFace(mesh, center, ring[next], ring[i], material);
    } else {
      addFace(mesh, center, ring[i], ring[next], material);
    }
  }
}

function addHexHead(mesh) {
  const phase = Math.PI / 6;
  const rings = [
    ringX(-1.35, 0.64, 6, phase),
    ringX(-1.16, 0.86, 6, phase),
    ringX(-0.42, 0.86, 6, phase),
    ringX(-0.25, 0.62, 6, phase)
  ];

  addRingSurface(mesh, rings, 6, 1);
  addCap(mesh, rings[0], -1.35, 1, true);
  addCap(mesh, rings[rings.length - 1], -0.25, 1, false);
}

function threadRadius(x, theta) {
  const pitch = 0.145;
  const phase = (x / pitch - theta / (Math.PI * 2)) * Math.PI * 2;
  const crest = Math.max(0, Math.cos(phase));
  return 0.37 + Math.pow(crest, 4) * 0.065;
}

function addThreadedShaft(mesh) {
  const sides = 52;
  const lengthSegments = 250;
  const rings = [];
  const start = 0.08;
  const end = 4.82;

  rings.push(ringX(-0.25, 0.39, sides));
  rings.push(ringX(0.08, 0.39, sides));

  for (let i = 0; i <= lengthSegments; i += 1) {
    const x = start + ((end - start) * i) / lengthSegments;
    const ring = [];
    for (let j = 0; j < sides; j += 1) {
      const theta = (j / sides) * Math.PI * 2;
      const radius = threadRadius(x, theta);
      ring.push([x, Math.cos(theta) * radius, Math.sin(theta) * radius]);
    }
    rings.push(ring);
  }

  rings.push(ringX(4.96, 0.32, sides));
  addRingSurface(mesh, rings, sides, 1);
  addCap(mesh, rings[rings.length - 1], 4.96, 1, false);
}

function addStudioPlane(mesh) {
  addQuad(mesh, [-5.2, -0.92, -2.7], [6.4, -0.92, -2.7], [7.2, -0.92, 2.8], [-6.0, -0.92, 2.8], 0);
}

function createFastenerMesh() {
  const mesh = {
    positions: [],
    normals: [],
    materials: []
  };

  addStudioPlane(mesh);
  addHexHead(mesh);
  addThreadedShaft(mesh);

  return {
    positions: new Float32Array(mesh.positions),
    normals: new Float32Array(mesh.normals),
    materials: new Float32Array(mesh.materials),
    count: mesh.positions.length / 3
  };
}

function createMatrix() {
  return new Float32Array(16);
}

function identity(out) {
  out.set([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  return out;
}

function multiply(out, a, b) {
  const result = createMatrix();
  for (let col = 0; col < 4; col += 1) {
    for (let row = 0; row < 4; row += 1) {
      result[col * 4 + row] =
        a[0 * 4 + row] * b[col * 4 + 0] +
        a[1 * 4 + row] * b[col * 4 + 1] +
        a[2 * 4 + row] * b[col * 4 + 2] +
        a[3 * 4 + row] * b[col * 4 + 3];
    }
  }
  out.set(result);
  return out;
}

function perspective(out, fovy, aspect, near, far) {
  const f = 1 / Math.tan(fovy / 2);
  identity(out);
  out[0] = f / aspect;
  out[5] = f;
  out[10] = (far + near) / (near - far);
  out[11] = -1;
  out[14] = (2 * far * near) / (near - far);
  out[15] = 0;
  return out;
}

function lookAt(out, eye, center, up) {
  const z = normalize(subtract(eye, center));
  const x = normalize(cross(up, z));
  const y = cross(z, x);

  out.set([
    x[0], y[0], z[0], 0,
    x[1], y[1], z[1], 0,
    x[2], y[2], z[2], 0,
    -(x[0] * eye[0] + x[1] * eye[1] + x[2] * eye[2]),
    -(y[0] * eye[0] + y[1] * eye[1] + y[2] * eye[2]),
    -(z[0] * eye[0] + z[1] * eye[1] + z[2] * eye[2]),
    1
  ]);

  return out;
}

function makeModelMatrix(time, aspect) {
  const rotation = (time % 10) / 10 * Math.PI * 2;
  const cX = Math.cos(rotation);
  const sX = Math.sin(rotation);
  const yaw = aspect < 0.8 ? -0.28 : -0.38;
  const pitch = -0.1;
  const cY = Math.cos(yaw);
  const sY = Math.sin(yaw);
  const cZ = Math.cos(pitch);
  const sZ = Math.sin(pitch);
  const scale = aspect < 0.8 ? 0.46 : 0.62;
  const translateX = aspect < 0.8 ? 2.2 : 3.78;
  const translateY = aspect < 0.8 ? -0.96 : -0.58;

  const spinX = new Float32Array([
    1, 0, 0, 0,
    0, cX, sX, 0,
    0, -sX, cX, 0,
    0, 0, 0, 1
  ]);
  const yawY = new Float32Array([
    cY, 0, -sY, 0,
    0, 1, 0, 0,
    sY, 0, cY, 0,
    0, 0, 0, 1
  ]);
  const tiltZ = new Float32Array([
    cZ, sZ, 0, 0,
    -sZ, cZ, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ]);
  const transform = new Float32Array([
    scale, 0, 0, 0,
    0, scale, 0, 0,
    0, 0, scale, 0,
    translateX, translateY, 0, 1
  ]);

  const temp = createMatrix();
  const temp2 = createMatrix();
  multiply(temp, yawY, spinX);
  multiply(temp2, tiltZ, temp);
  multiply(temp, transform, temp2);
  return temp;
}

function initFastenerHero() {
  if (!fastenerCanvas || reduceMotionQuery.matches) {
    return null;
  }

  const gl = fastenerCanvas.getContext("webgl", {
    alpha: true,
    antialias: true,
    powerPreference: "high-performance"
  });

  if (!gl) {
    return null;
  }

  const vertexSource = `
    attribute vec3 aPosition;
    attribute vec3 aNormal;
    attribute float aMaterial;
    uniform mat4 uModel;
    uniform mat4 uViewProjection;
    varying vec3 vWorldPos;
    varying vec3 vNormal;
    varying float vMaterial;

    void main() {
      vec4 world = uModel * vec4(aPosition, 1.0);
      vWorldPos = world.xyz;
      vNormal = normalize(mat3(uModel) * aNormal);
      vMaterial = aMaterial;
      gl_Position = uViewProjection * world;
    }
  `;

  const fragmentSource = `
    precision highp float;
    varying vec3 vWorldPos;
    varying vec3 vNormal;
    varying float vMaterial;
    uniform float uTime;
    uniform vec3 uCamera;

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(uCamera - vWorldPos);
      vec3 lightA = normalize(vec3(-0.45 + sin(uTime * 0.55) * 0.18, 0.84, 0.38));
      vec3 lightB = normalize(vec3(0.58, 0.26, 0.72));
      float key = max(dot(normal, lightA), 0.0);
      float fill = max(dot(normal, lightB), 0.0);
      float rim = pow(1.0 - max(dot(normal, viewDir), 0.0), 2.2);
      float sweep = pow(max(dot(reflect(-lightA, normal), viewDir), 0.0), 70.0);
      float tight = pow(max(dot(reflect(-lightB, normal), viewDir), 0.0), 130.0);

      vec3 metalBase = vec3(0.42, 0.43, 0.42);
      vec3 metalHigh = vec3(0.92, 0.91, 0.86);
      vec3 floorBase = vec3(0.018, 0.021, 0.023);
      vec3 floorHigh = vec3(0.10, 0.11, 0.12);
      float brushed = sin((vWorldPos.x * 12.0 + vWorldPos.z * 5.0) + normal.y * 4.0) * 0.035;

      vec3 metal = mix(metalBase, metalHigh, key * 0.72 + fill * 0.18) + brushed;
      metal += vec3(1.0, 0.96, 0.86) * sweep * 0.9;
      metal += vec3(0.74, 0.86, 1.0) * tight * 0.35;
      metal += vec3(0.72, 0.84, 1.0) * rim * 0.18;

      float floorLight = max(dot(normal, lightA), 0.0);
      float fade = smoothstep(-3.2, 4.4, vWorldPos.x);
      vec3 floorColor = mix(floorBase, floorHigh, floorLight * 0.5 + fade * 0.22);

      vec3 color = mix(floorColor, metal, step(0.5, vMaterial));
      float vignette = smoothstep(6.2, -1.0, length(vWorldPos.xy));
      color *= 0.72 + vignette * 0.28;

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  const program = createProgram(gl, vertexSource, fragmentSource);
  const mesh = createFastenerMesh();
  const positionBuffer = gl.createBuffer();
  const normalBuffer = gl.createBuffer();
  const materialBuffer = gl.createBuffer();
  const uniforms = {
    model: gl.getUniformLocation(program, "uModel"),
    viewProjection: gl.getUniformLocation(program, "uViewProjection"),
    time: gl.getUniformLocation(program, "uTime"),
    camera: gl.getUniformLocation(program, "uCamera")
  };
  const attributes = {
    position: gl.getAttribLocation(program, "aPosition"),
    normal: gl.getAttribLocation(program, "aNormal"),
    material: gl.getAttribLocation(program, "aMaterial")
  };
  const projection = createMatrix();
  const view = createMatrix();
  const viewProjection = createMatrix();
  const camera = [0, 0.12, 6.15];
  let animationId = 0;
  let start = performance.now();

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, mesh.positions, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, mesh.normals, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, materialBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, mesh.materials, gl.STATIC_DRAW);
  gl.enable(gl.DEPTH_TEST);

  function bindAttribute(buffer, location, size) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
  }

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.floor(fastenerCanvas.clientWidth * ratio));
    const height = Math.max(1, Math.floor(fastenerCanvas.clientHeight * ratio));

    if (fastenerCanvas.width !== width || fastenerCanvas.height !== height) {
      fastenerCanvas.width = width;
      fastenerCanvas.height = height;
    }

    gl.viewport(0, 0, width, height);
    perspective(projection, Math.PI / 4.2, width / height, 0.1, 100);
    lookAt(view, camera, [0.9, -0.3, 0], [0, 1, 0]);
    multiply(viewProjection, projection, view);
  }

  function render(now) {
    resize();

    const time = (now - start) / 1000;
    const aspect = fastenerCanvas.width / fastenerCanvas.height;
    const model = makeModelMatrix(time, aspect);

    gl.clearColor(0.01, 0.012, 0.014, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(program);
    bindAttribute(positionBuffer, attributes.position, 3);
    bindAttribute(normalBuffer, attributes.normal, 3);
    bindAttribute(materialBuffer, attributes.material, 1);
    gl.uniformMatrix4fv(uniforms.model, false, model);
    gl.uniformMatrix4fv(uniforms.viewProjection, false, viewProjection);
    gl.uniform1f(uniforms.time, time);
    gl.uniform3fv(uniforms.camera, camera);
    gl.drawArrays(gl.TRIANGLES, 0, mesh.count);

    animationId = requestAnimationFrame(render);
  }

  document.body.classList.add("webgl-ready");
  animationId = requestAnimationFrame(render);

  return {
    pause() {
      cancelAnimationFrame(animationId);
    },
    resume() {
      start = performance.now();
      animationId = requestAnimationFrame(render);
    }
  };
}

let fastenerHero = initFastenerHero();

function syncMotionPreference(event) {
  if (event.matches) {
    stopTasteMotion();
    if (fastenerHero) {
      fastenerHero.pause();
      fastenerHero = null;
    }
    document.body.classList.remove("webgl-ready");
    return;
  }

  fastenerHero = initFastenerHero();
  initTasteMotion();
}

if (reduceMotionQuery.addEventListener) {
  reduceMotionQuery.addEventListener("change", syncMotionPreference);
} else if (reduceMotionQuery.addListener) {
  reduceMotionQuery.addListener(syncMotionPreference);
}
