// ==UserScript==
// @name         BoxCritters Shaders
// @namespace    https://boxcrittersmods.ga/
// @version      0.53
// @description  Create shaders for boxcritters
// @author       TumbleGamer, SArpnt
// @match        https://boxcritters.com/play/*
// ==/UserScript==

(function () {
	'use strict'
	console.info("-----------------------------------")
	console.info("[BOX CRITTERS SHADER LOADER]")
	console.info("A mod created by TumbleGamer, with help from SArpnt")
	console.info("-----------------------------------")
	unsafeWindow.addEventListener('load', function () {
		function createContext(width, height) {
			let canvas = document.createElement("canvas")
			canvas.width = width
			canvas.height = height
			//document.body.appendChild(canvas);

			let gl = canvas.getContext("webgl2") || canvas.getContext("webgl")
			gl.clearColor(0.0, 0.0, 0.0, 1.0)
			gl.clear(gl.COLOR_BUFFER_BIT)
			return gl
		}

		function createShader(gl, type, source) {
			let shader = gl.createShader(type)
			gl.shaderSource(shader, source)
			gl.compileShader(shader)
			let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
			if (success) return shader

			console.log(gl.getShaderInfoLog(shader))
			gl.deleteShader(shader)
		}

		function createProgram(gl, vertexShader, fragmentShader) {
			let program = gl.createProgram()
			gl.attachShader(program, vertexShader)
			gl.attachShader(program, fragmentShader)
			gl.linkProgram(program)
			let success = gl.getProgramParameter(program, gl.LINK_STATUS)
			if (success) return program
			console.log(gl.getProgramInfoLog(program))
			gl.deleteProgram(program)
		}

		function createMesh(gl, data) {
			//let VAO = gl.createVertexArray()
			let VBO = gl.createBuffer()
			gl.bindBuffer(gl.ARRAY_BUFFER, VBO)
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.vertices), gl.STATIC_DRAW)

			let texCoordBuffer = gl.createBuffer()
			gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer)
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.texCoords), gl.STATIC_DRAW)

			let EBO = gl.createBuffer()
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, EBO)
			gl.bufferData(
				gl.ELEMENT_ARRAY_BUFFER,
				new Uint16Array(data.indices),
				gl.STATIC_DRAW
			)
			return { data, VBO, texCoordBuffer, EBO }
		}

		function createScreenQuad(gl) {
			let vertices = [-1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0]
			let texCoords = [0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0]
			let indices = [0, 1, 2, 0, 2, 3]
			return createMesh(gl, { vertices, texCoords, indices })
		}

		function createTexture(gl) {
			let texture = gl.createTexture()
			gl.bindTexture(gl.TEXTURE_2D, texture)
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
			gl.bindTexture(gl.TEXTURE_2D, null)

			return texture
		}

		function render(gl, mesh, shader, texture, data = {}) {
			gl.useProgram(shader)

			let aPosLoc = gl.getAttribLocation(shader, "aPos")
			gl.bindBuffer(gl.ARRAY_BUFFER, mesh.VBO)
			gl.enableVertexAttribArray(aPosLoc)
			gl.vertexAttribPointer(aPosLoc, 2, gl.FLOAT, false, 0, 0)

			let aTexCoordLoc = gl.getAttribLocation(shader, "aTexCoord")
			gl.bindBuffer(gl.ARRAY_BUFFER, mesh.texCoordBuffer)
			gl.enableVertexAttribArray(aTexCoordLoc)
			gl.vertexAttribPointer(aTexCoordLoc, 2, gl.FLOAT, false, 0, 0)

			let uStageTexLoc = gl.getUniformLocation(shader, "uStageTex")
			gl.activeTexture(gl.TEXTURE0)
			gl.bindTexture(gl.TEXTURE_2D, texture)
			gl.uniform1i(uStageTexLoc, 0)

			for (let key in data) {
				let value = data[key]
				let location = gl.getUniformLocation(shader, key)
				if (location == -1) continue

				if (Array.isArray(value))
					if (value.length < 5 && value.length > 0) gl[`uniform${value.length}fv`](location, value)
					else
						gl.uniform1f(location, value)
			}

			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.EBO)
			gl.drawElements(gl.TRIANGLES, mesh.data.indices.length, gl.UNSIGNED_SHORT, 0)
		}
		var GLSLFilter = (() => {
			function GLSLFilter({ dame,shader, data }) {
				console.log("GLSLFilter")
				let gl = GLSLFilter.gl
				let vertexShader = createShader(gl, gl.VERTEX_SHADER, GLSLFilter.VERTEX_SHADER)
				let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, shader)
				let program = createProgram(gl, vertexShader, fragmentShader)
				if (!program) return
				let quad = createScreenQuad(gl)
				let texture = createTexture(gl)

				this.name = name;
				this.data = data

				this.shader = program
				this.mesh = quad
				this.texture = texture

				this.SHADER_BODY = shader
				this.usesContext = true
			}
			GLSLFilter.gl = createContext(unsafeWindow.innerWidth, unsafeWindow.innerHeight)
			GLSLFilter.VERTEX_SHADER = `#version 300 es
				in vec4 aPos;
				in vec2 aTexCoord;

				out vec2 vPixelCoord;

				void main(){
					vPixelCoord = vec2(aTexCoord.x,1.0-aTexCoord.y);
					gl_Position = aPos;
				}`
			GLSLFilter.DEFAULT_SHADER = {
				shader: `#version 300 es
					precision mediump float;

					in vec2 vPixelCoord;
					out vec4 fColor;

					void main() {
						fColor = texture(uStageTex,vPixelCoord);
					}`,
				uniforms: _ => ({}),
				container: world.stage
			}
			let p = createjs.extend(GLSLFilter, createjs.Filter)

			p.getBounds = () => new createjs.Rectangle(0, 0, 0, 0)
			p.applyFilter = function (
				context,
				x,
				y,
				width,
				height,
				targetContext,
				targetX,
				targetY
			) {
				let gl = GLSLFilter.gl
				targetContext || (targetContext = context)
				targetX || (targetX = x)
				targetY || (targetY = y)

				gl.bindTexture(gl.TEXTURE_2D, this.texture)
				gl.texImage2D(
					gl.TEXTURE_2D,
					0,
					gl.RGBA,
					gl.RGBA,
					gl.UNSIGNED_BYTE,
					context.canvas
				)
				//gl.generateMipmap(gl.TEXTURE_2D);
				gl.bindTexture(gl.TEXTURE_2D, null)

				gl.canvas.width = width
				gl.canvas.height = height
				gl.viewport(0, 0, width, height)
				gl.clearColor(0, 0, 0, 1)
				gl.clear(gl.COLOR_BUFFER_BIT)

				render(gl, this.mesh, this.shader, this.texture, Object.assign({
					uViewportSize: [width, height],
					uRandom: Math.random(),
					uTime: performance.now(),
				}, this.data()))

				targetContext.setTransform(1, 0, 0, 1, 0, 0)
				targetContext.clearRect(0, 0, width, height)
				targetContext.drawImage(gl.canvas, targetX, targetY)
			}
			p.clone = function () {
				return new GLSLFilter(this.VTX_SHADER_BODY, this.FRAG_SHADER_BODY)
			}
			p.toString = function () {
				return "[GLSLFilter]"
			}

			return createjs.promote(GLSLFilter, "Filter")
		})()

		unsafeWindow.loadShader = function ({ name,fs, shader, container, uniforms } = {}) {
			if (fs) {
				shader = fs
				console.warn('"fs" property is depricated, use "shader"')
			}
			if (!shader) throw "No shader!"
			container || (container = GLSLFilter.DEFAULT_SHADER.container)
			uniforms || (uniforms = GLSLFilter.DEFAULT_SHADER.uniforms)
			let filter = new GLSLFilter({ name,shader, data: uniforms })
			container.stage.on("stagemousemove", function (e) {
				filter.data.uMousePos = [e.rawX, e.rawY]
			})
			if (!container.bitmapCache) {
				container.cache(0, 0, container.width, container.height)
				container.cacheTickOff = createjs.Ticker.on("tick", function (t) { container.updateCache() })
			}
			container.filters || (container.filters = [])
			container.filters.push(filter)

			console.dir(filter)
			return filter
		}
		unsafeWindow.clearShaders = function (container = GLSLFilter.DEFAULT_SHADER.container) {
			container.filters = []
			createjs.Ticker.off(container.cacheTickOff)
		}
	}, false)
})()