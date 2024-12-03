import zlib from 'zlib';

// 压缩函数
export const compress = async (data) => {
	return new Promise((resolve, reject) => {
		zlib.deflate(data, (err, buffer) => {
			if (err) {
				reject(err);
			} else {
				resolve(buffer);
			}
		});
	});
}

// 解压缩函数
export const decompress = async (data) => {
	return new Promise((resolve, reject) => {
		zlib.inflate(data, (err, buffer) => {
			if (err) {
				reject(err);
			} else {
				resolve(buffer);
			}
		});
	});
};

// 示例使用
const originalData = 'Hello, this is a test string!';

compress(Buffer.from(originalData))
	.then(compressedData => {
		console.log('Compressed data:', compressedData);

		return decompress(compressedData);
	})
	.then(decompressedData => {
		console.log('Decompressed data:', decompressedData.toString());
	})
	.catch(err => {
		console.error('Error:', err);
	});