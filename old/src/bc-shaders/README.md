# Hello World

*Based off: [https://github.com/baseten/easelbender]*

# Steps (for now)
1. install https://boxcrittersmods.ga/tools/
2. install https://github.com/boxcritters/bc-shaders/raw/master/bc-shaders.user.js
# Sample Usage
```js
loadShader({
	shader:
		`#version 300 es
		precision mediump float;

		in vec2 vPixelCoord;
		out vec4 fColor;

		uniform sampler2D uStageTex;
		uniform float uTime;
		uniform vec2 uViewportSize;
		uniform vec2 uMousePos;

		uniform vec2 uCustomUniform;

		void main() {
			fColor = texture(uStageTex,vPixelCoord);
		}`,
	container: world.stage,
	uniforms: function () {
		return { uCustomUniform: [0.0, 0.5] }
	}
})
```

# params
{
* shader: GLSL Shader
* container: createjs stage to apply shader to
* uniforms: Custom uniforms
}

# Built in uniforms
* sampler2D uStageTex
* float uTime
* vec2 uViewportSize
* vec2 uMousePos
* float uRandom
