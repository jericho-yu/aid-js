import sm3 from 'sm3';

// SM3 encoding
export const sm3Hash = async (original) => {
	return sm3(original);
};

// Example usage
const originalData = 'Hello, this is a test string!';
const sm3HashValue = await sm3Hash(originalData);
console.log('SM3 Hash:', sm3HashValue);