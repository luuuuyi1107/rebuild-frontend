export const isApiProd = ["https://76c057.com/", "/"].includes(import.meta.env.VITE_API_URL)

export default isApiProd
  ? {
      //prod
      USDT_BANK_ID: 44,
    }
  : {
      // dev
      USDT_BANK_ID: 4,
    }
