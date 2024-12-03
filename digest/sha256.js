import crypto from 'crypto';

// SHA-256 encoding
export const sha256 = async (original) => {
	const hash = crypto.createHash('sha256');
	hash.update(original);
	return hash.digest('hex');
};

// Example usage
const originalData = 'Hello, this is a test string!';
const sha256Hash = await sha256(originalData);
console.log('SHA-256 Hash:', sha256Hash);