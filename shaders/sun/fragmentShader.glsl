uniform Simpler2D u_text;
uniform mat4 viewMatrix;
uniform vec3 cameraPosition;


void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
	vec2 uv = fragCoord.xy / iResolution.xy;
   
    vec4 dist = texture(u_texture_0, uv+(iTime*0.1f)); //add time to make it move
    vec2 distorter = dist.rr * vec2(0.05f,0.05f);
    vec4 color = texture(iChannel0, uv + distorter);
    
    fragColor = color.rgba;
    
}