export function drawMatrix(
	ctx,
	matrix, 
	position, 
	blockSize, 
	colorScheme = {
		pieces: ['red', 'blue', 'purple', 'pink','orange', 'indigo', 'green'],
		outline: 'black',
	}
)
{
	for(let y = 0; y < matrix.length; y++) {
		for (let x = 0; x < matrix[y].length; x++){
			if(matrix[y][x]){
				ctx.fillStyle = colorScheme.pieces[matrix[y][x] - 1];
				ctx.fillRect(
					(x + position.x) * blockSize, 
					(y + position.y) * blockSize, 
					blockSize, 
					blockSize
				);	
				ctx.strokeStyle = colorScheme.outline;
				ctx.strokeRect(
					(x + position.x) * blockSize, 
					(y + position.y) * blockSize, 
					blockSize, 
					blockSize
				)						
			}
		}
	}
}

export function canvasText(ctx, text, font ='Arial', size, startX, startY, fillStyle, textAlign = "start") {
	ctx.font = size + " " + font;
	ctx.fillStyle = fillStyle;
	ctx.textAlign = textAlign;
	ctx.fillText(text, startX, startY, 80)
}