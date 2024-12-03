import xlsx from 'xlsx';
import { DataFrame } from 'dataframe-js';

export class Reader {
	constructor() {
		this.data = new Map();
		this.sheetName = '';
		this.originalRow = 1;
		this.finishedRow = 0;
		this.titleRow = 0;
		this.titles = [];
	}

	autoRead(filename) {
		return this
			.openFile(filename)
			.setOriginalRow(2)
			.setTitleRow(1)
			.setSheetName('Sheet1')
			.readTitle()
			.read();
	}

	autoReadBySheetName(sheetName, filename) {
		return this
			.openFile(filename)
			.setOriginalRow(2)
			.setTitleRow(1)
			.setSheetName(sheetName)
			.readTitle()
			.read();
	}

	dataWithTitle() {
		const newDict = new Map();
		this.data.forEach((value, key) => {
			const newMap = {};
			this.titles.forEach((title, index) => {
				newMap[title] = value[index];
			});
			newDict.set(key, newMap);
		});
		return newDict;
	}

	setDataByRow(rowNumber, data) {
		this.data.set(rowNumber, data);
		return this;
	}

	setSheetName(sheetName) {
		this.sheetName = sheetName;
		return this;
	}

	setOriginalRow(originalRow) {
		this.originalRow = originalRow - 1;
		return this;
	}

	setFinishedRow(finishedRow) {
		this.finishedRow = finishedRow - 1;
		return this;
	}

	setTitleRow(titleRow) {
		this.titleRow = titleRow - 1;
		return this;
	}

	setTitle(titles) {
		if (titles.length === 0) {
			throw new Error('Title cannot be empty');
		}
		this.titles = titles;
		return this;
	}

	openFile(filename) {
		if (!filename) {
			throw new Error('Filename cannot be empty');
		}
		this.workbook = xlsx.readFile(filename);
		return this;
	}

	readTitle() {
		if (!this.sheetName) {
			throw new Error('Sheet name is not set');
		}
		const sheet = this.workbook.Sheets[this.sheetName];
		const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });
		this.setTitle(rows[this.titleRow]);
		return this;
	}

	read() {
		if (!this.sheetName) {
			throw new Error('Sheet name is not set');
		}
		const sheet = this.workbook.Sheets[this.sheetName];
		const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });
		const startRow = this.originalRow;
		const endRow = this.finishedRow || rows.length;
		for (let i = startRow; i < endRow; i++) {
			this.setDataByRow(i, rows[i]);
		}
		return this;
	}

	toDataFrameDefaultType() {
		const titleWithType = {};
		this.titles.forEach(title => {
			titleWithType[title] = 'string';
		});
		return this.toDataFrame(titleWithType);
	}

	toDataFrame(titleWithType) {
		if (!this.sheetName) {
			throw new Error('Sheet name is not set');
		}
		const sheet = this.workbook.Sheets[this.sheetName];
		const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });
		const content = rows.slice(this.titleRow, this.finishedRow || rows.length);
		return new DataFrame(content, Object.keys(titleWithType));
	}

	toDataFrameDetectType() {
		if (!this.sheetName) {
			throw new Error('Sheet name is not set');
		}
		const sheet = this.workbook.Sheets[this.sheetName];
		const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });
		const content = rows.slice(this.titleRow, this.finishedRow || rows.length);
		return new DataFrame(content);
	}
}

// module.exports = Reader;