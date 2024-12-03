import crypto from 'crypto';

// MD5 encoding
export const md5 = async (original) => {
	const hash = crypto.createHash('md5');
	hash.update(original);
	return hash.digest('hex');
};

// Example usage
const originalData = 'Hello, this is a test string!';
const md5Hash = await md5(originalData);
console.log('MD5 Hash:', md5Hash);