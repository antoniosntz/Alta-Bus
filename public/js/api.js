const API = {
    async buscarGpsTraccar() {
        try {
            const response = await fetch('/api/rastreio');
            return await response.json();
        } catch (error) {
            console.error("Erro ao buscar dados do servidor", error);
        }
    }
};