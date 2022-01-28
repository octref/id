const LIGHT_GRAY = '#bbb'
const CANVAS_GAP = 12
const RECT_RADIUS = 2
const CIRCLE_COLOR = 'red'
const CIRCLE_RADIUS = 5

let dimx, dimy
let gaph, gapv

let mousex = 0,
  mousey = 0
let sideX = 0,
  sideY = 0

let inDeadZone = false

let shearSide = 'right'
function getShearAngle() {
  if (shearSide === 'right') {
    return Math.PI / 4
  } else {
    return (Math.PI / 4) * 3
  }
}

let drawExplanations = false
let drawHorizontalRects = true
let drawVerticalRects = false

let doLooping = true

let doRecording = false
let recorder

let cnv: p5.Renderer

function setDimensions() {
  if (doLooping) {
    const rad = radians(deg)
    const arm = min(windowWidth, windowHeight) * 0.4

    mousex = (windowWidth - CANVAS_GAP * 2) / 2 + cos(rad) * arm
    mousey = (windowHeight - CANVAS_GAP * 2) / 2 + sin(rad) * arm
  } else {
    mousex = mouseX
    mousey = mouseY
  }

  dimx = windowWidth - CANVAS_GAP * 2
  dimy = windowHeight - CANVAS_GAP * 2

  gapv = min(dimx, dimy) / 100
  gaph = gapv * 1.32

  sideY = abs(mousey - dimy / 2) - gapv
  sideX = abs(mousex - dimx / 2) - gaph - abs(sideY * tan(getShearAngle()))
  if (sideX < 0) {
    sideX =
      abs(sideY * tan(getShearAngle())) -
      (abs(mousex - dimx / 2) - gaph) -
      gaph * 2
  }

  if (sideY < 0 || sideX < 0) {
    inDeadZone = true
  } else {
    inDeadZone = false
  }

  if (mousex < dimx / 2) {
    shearSide = 'left'
  } else {
    shearSide = 'right'
  }

  if (mousex < dimx / 2) {
    shearSide = 'left'
  } else {
    shearSide = 'right'
  }

  const mouseAngle = atan2(mousey - dimy / 2, mousex - dimx / 2)

  if (
    (mouseAngle > 0 && mouseAngle < Math.PI / 4) ||
    (mouseAngle > Math.PI / 2 && mouseAngle < (Math.PI / 4) * 3)
  ) {
    drawExplanations = true
  } else {
    drawExplanations = false
  }

  if (sideX > sideY / abs(cos(getShearAngle()))) {
    drawHorizontalRects = true
  } else {
    drawHorizontalRects = false
  }
  if (sideY > sideX * abs(cos(getShearAngle()))) {
    drawVerticalRects = true
  } else {
    drawVerticalRects = false
  }
}

let deg
let initDeg

function setup() {
  deg = 203
  initDeg = deg

  setDimensions()
  cnv = createCanvas(dimx, dimy)
}

function windowResized() {
  setDimensions()
  resizeCanvas(dimx, dimy)
}

function draw() {
  if (doRecording) {
    if (frameCount === 1) {
      startRecording()
    }
  }

  if (doLooping) {
    deg += 0.25
  }

  setDimensions()

  if (inDeadZone || drawExplanations) {
    cnv.addClass('explain')
  } else {
    cnv.removeClass('explain')
  }

  if (inDeadZone) {
    background('white')
    drawDeadZone()
    drawPendulum()
    return
  }

  if (drawExplanations) {
    background('white')
    drawDeadZone()
  } else {
    background('black')
  }

  if (drawExplanations) {
    push()
    stroke(LIGHT_GRAY)
    noFill()

    circle(mousex, mousey, 20)
    pop()

    push()

    translate(dimx / 2, dimy / 2)

    stroke(LIGHT_GRAY)
    noFill()
    if (drawHorizontalRects) {
      drawHorizontalShearedRectsInQuadrant(1, 1)
    }
    if (drawVerticalRects) {
      drawVerticalShearedRectsInQuadrant(1, 1)
    }

    pop()
  }

  push()
  if (drawExplanations) {
    stroke('black')
    fill('black')
  } else {
    stroke('white')
    fill('white')
  }

  translate(dimx / 2, dimy / 2)
  if (drawHorizontalRects) {
    drawHorizontalShearedRectsInQuadrant(1, -1)
    drawHorizontalShearedRectsInQuadrant(-1, -1)
    drawHorizontalShearedRectsInQuadrant(-1, 1)
  }

  if (drawVerticalRects) {
    drawVerticalShearedRectsInQuadrant(1, -1)
    drawVerticalShearedRectsInQuadrant(-1, -1)
    drawVerticalShearedRectsInQuadrant(-1, 1)
  }
  pop()

  if (doLooping) {
    drawPendulum()
  }

  function drawDeadZone() {
    push()

    translate(dimx / 2, dimy / 2)

    stroke(LIGHT_GRAY)
    fill(LIGHT_GRAY)

    function drawAngledVerticalline(vOffset, angle) {
      push()
      translate(0, vOffset)
      shearX(angle)
      line(gaph, -dimy / 2 - vOffset, gaph, dimy / 2 - vOffset)
      line(-gaph, -dimy / 2 - vOffset, -gapv, dimy / 2 - vOffset)
      pop()
    }

    drawAngledVerticalline(-gapv, -getShearAngle())
    drawAngledVerticalline(-gapv, getShearAngle())
    drawAngledVerticalline(gapv, -getShearAngle())
    drawAngledVerticalline(gapv, getShearAngle())

    line(-dimx / 2, gapv, dimx / 2, gapv)
    line(-dimx / 2, -gapv, dimx / 2, -gapv)

    stroke(CIRCLE_COLOR)
    fill(CIRCLE_COLOR)

    circle(gaph, gapv, CIRCLE_RADIUS)
    circle(-gaph, gapv, CIRCLE_RADIUS)
    circle(gaph, -gapv, CIRCLE_RADIUS)
    circle(-gaph, -gapv, CIRCLE_RADIUS)

    pop()
  }

  function drawHorizontalShearedRectsInQuadrant(xDirection, yDirection) {
    const unitSideX = sideY / abs(cos(getShearAngle()))
    const reverseXOffsetMultiplier = xDirection === -1 ? -1 : 0
    push()

    translate(gaph * xDirection, gapv * yDirection)
    shearX(getShearAngle() * yDirection)

    for (let i = 0; true; i++) {
      if (i * (unitSideX + gaph * 2) > sideX) {
        break
      }

      if (
        i * (unitSideX + gaph * 2) < sideX &&
        i * (unitSideX + gaph * 2) + unitSideX > sideX
      ) {
        const diffX = sideX - i * (unitSideX + gaph * 2)
        rect(
          i * xDirection * (unitSideX + gaph * 2) +
            reverseXOffsetMultiplier * diffX,
          0,
          diffX,
          sideY * yDirection,
          RECT_RADIUS,
          RECT_RADIUS,
          RECT_RADIUS,
          RECT_RADIUS
        )
        break
      } else {
        rect(
          i * xDirection * (unitSideX + gaph * 2) +
            reverseXOffsetMultiplier * unitSideX,
          0,
          unitSideX,
          sideY * yDirection,
          RECT_RADIUS,
          RECT_RADIUS,
          RECT_RADIUS,
          RECT_RADIUS
        )
      }
    }

    pop()
  }

  function drawVerticalShearedRectsInQuadrant(xDirection, yDirection) {
    const unitSideY = sideX * abs(cos(getShearAngle()))
    const reverseXOffsetMultiplier = xDirection === -1 ? -1 : 0

    push()

    translate(gaph * xDirection, gapv * yDirection)
    shearX(getShearAngle() * yDirection)

    for (let i = 0; true; i++) {
      if (i * (unitSideY + gapv * 2) > sideY) {
        break
      }

      if (
        i * (unitSideY + gapv * 2) < sideY &&
        i * (unitSideY + gapv * 2) + unitSideY > sideY
      ) {
        const diffY = sideY - i * (unitSideY + gapv * 2)
        rect(
          reverseXOffsetMultiplier * sideX,
          i * yDirection * (unitSideY + gapv * 2),
          sideX,
          diffY * yDirection,
          RECT_RADIUS,
          RECT_RADIUS,
          RECT_RADIUS,
          RECT_RADIUS
        )
        break
      } else {
        rect(
          reverseXOffsetMultiplier * sideX,
          i * yDirection * (unitSideY + gapv * 2),
          sideX,
          unitSideY * yDirection,
          RECT_RADIUS,
          RECT_RADIUS,
          RECT_RADIUS,
          RECT_RADIUS
        )
      }
    }

    pop()
  }

  function drawPendulum() {
    push()
    stroke(CIRCLE_COLOR)
    fill(CIRCLE_COLOR)
    circle(mousex, mousey, CIRCLE_RADIUS)
    pop()
  }

  if (doRecording) {
    if (deg >= initDeg + 360) {
      recorder.stop()
      noLoop()
    }
  }
}

function startRecording() {
  console.log('start recording')

  const chunks = []
  const stream = cnv.elt.captureStream()
  recorder = new MediaRecorder(stream)
  recorder.ondataavailable = (e) => chunks.push(e.data)
  recorder.onstop = (e) => exportVid(new Blob(chunks, { type: 'video/webm' }))

  recorder.start()
}

function exportVid(blob) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.style.display = 'none'
  a.href = url
  a.download = 'id.webm'
  a.click()
  window.URL.revokeObjectURL(url)

  console.log('done recording')
}

function mouseMoved() {
  doLooping = false

  mousex = mouseX
  mousey = mouseY

  setDimensions()
}

function touchMoved() {
  doLooping = false

  mousex = mouseX
  mousey = mouseY

  setDimensions()
}
