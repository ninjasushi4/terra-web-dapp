import { useEffect, useState } from "react"
import { useWallet } from "@terra-money/wallet-provider"
import { useProtocol } from "../../data/contract/protocol"

type State = "OPEN" | "CLOSED"

const useLatest = () => {
  const { network } = useWallet()
  const { getSymbol, getIsDelisted } = useProtocol()
  const [closed, setClosed] = useState<Dictionary<State>>({})
  const [error, setError] = useState<Error>()

  useEffect(() => {
    const load = async () => {
      try {
        const url =
          network.name === "testnet"
            ? "https://price-staging.mirror.finance/latest"
            : "https://price.mirror.finance/latest"
        const response = await fetch(url)
        const json: { states: Dictionary<State> } = await response.json()
        setClosed(json.states)
      } catch (error) {
        setError(error as Error)
      }
    }

    load()
  }, [network.name])

  const isClosed = (token: string) => {
    if (getIsDelisted(token)) return false

    const symbol = getSymbol(token)
    const ticker = symbol.slice(1)
    return symbol !== "uusd" && closed[ticker] === "CLOSED"
  }

  return { isClosed, error }
}

export default useLatest
