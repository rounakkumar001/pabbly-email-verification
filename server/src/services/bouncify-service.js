const axios = require('axios');
const FormData = require('form-data');
const { Readable } = require('stream');

class BouncifyService {
    constructor(apiKey) {
        this.apiKey = apiKey;
    }

    async verifyEmail(email) {
        try {
            const response = await axios.get(`https://api.bouncify.io/v1/verify?apikey=${this.apiKey}&email=${email}`);
            return response.data;
        } catch (error) {
            throw new Error(`Bouncify API Error: ${error.message}`);
        }
    }

    async uploadBulkEmail(fileBuffer, originalFilename, autoVerify = true) {
        const uniqueKey = Date.now();
        const params = {
            apikey: this.apiKey,
            auto_verify: autoVerify,
        };

        const fileStream = new Readable({
            read() {
                this.push(fileBuffer);
                this.push(null);
            },
        });

        const formData = new FormData();
        formData.append('local_file', fileStream, `${originalFilename}-${uniqueKey}`);

        try {
            const response = await axios.post('https://api.bouncify.io/v1/bulk', formData, {
                headers: {
                  ...formData.getHeaders(),
                },
                params: params,
            });
            return response.data;
        } catch (error) {
            throw new Error(`Bouncify API Error: ${error.message}`);
        }
    }

    async checkJobStatus(jobId) {
        try {
            const response = await axios.get(`https://api.bouncify.io/v1/bulk/${jobId}?apikey=${this.apiKey}`);
            return response.data;
        } catch (error) {
            throw new Error(`Bouncify API Error: ${error.message}`);
        }
    }

    async downloadBulkResults(jobId, filterOptions = ['deliverable', 'undeliverable', 'accept_all', 'unknown']) {
        const url = `https://api.bouncify.io/v1/download?jobId=${jobId}&apikey=${this.apiKey}`;
        try {
            const response = await axios.post(url, { filterResult: filterOptions }, { responseType: 'stream' });
            return response;
        } catch (error) {
            throw new Error(`Bouncify API Error: ${error.message}`);
        }
    }

    async getCreditsInfo() {
        try {
            const response = await axios.get(`https://api.bouncify.io/v1/info?apikey=${this.apiKey}`);
            return response.data.credits_info;
        } catch (error) {
            throw new Error(`Bouncify API Error: ${error.message}`);
        }
    }

    async startEmailVerification(jobId) {
        const url = `https://api.bouncify.io/v1/bulk/${jobId}?apikey=${this.apiKey}`;
        const headers = {
            'Content-Type': 'application/json'
        };
        const data = { "action": "start" };
        try {
            const response = await axios.patch(url, data, { headers });
            return response.data;
        } catch (error) {
            throw new Error(`Bouncify API Error: ${error.message}`);
        }
    }

    async deleteEmailList(jobId) {
        const url = `https://api.bouncify.io/v1/bulk/${jobId}?apikey=${this.apiKey}`;
        try {
            await axios.delete(url); 
        } catch (error) {
            throw new Error(`Bouncify API Error: ${error.message}`);
        }
    }
}

module.exports = BouncifyService;