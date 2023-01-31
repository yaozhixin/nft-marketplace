import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Row, Col, Card, Button } from 'react-bootstrap'
import { pipe } from 'it-pipe'
import { extract } from 'it-tar'
import all from 'it-all'
import toBuffer from 'it-to-buffer'
import map from 'it-map'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import IPFS from './IPFS'

/**
 * @param {Source} source
 */
 async function * tarballed (source) {
    yield * pipe(
        source,
        extract(),
        async function * (source) {
        for await (const entry of source) {
            yield {
            ...entry,
            body: await toBuffer(map(entry.body, (buf) => buf.slice()))
            }
        }
        }
    )
}

const Home = ({ marketplace, nft}) => {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const loadMarketplaceItems = async () => {
        const itemCount = await marketplace.itemCount()
        let items = []
        for (let i = 1; i <= itemCount; i++) {
            const item = await marketplace.items(i)
            if (!item.sold) {
                // get uri from nft contract
                const uri = await nft.tokenURI(item.tokenId)
                // use uri to fetch the nft metadata stored on ipfs
                const ipfs = await IPFS.getInstance()
                const file_info = await pipe(
                    ipfs.get(uri),
                    tarballed,
                    (source) => all(source)
                  )
                const file_info_obj = JSON.parse(uint8ArrayToString(file_info[0].body))
                
                const description = file_info_obj.description
                const name = file_info_obj.name
                const metadata = file_info_obj.image
                // get total price of item (item price + fee)
                const totalPrice = await marketplace.getTotalPrice(item.itemId)
                // Add item to items array
                items.push({
                    totalPrice,
                    itemId: item.itemId,
                    seller: item.seller,
                    name: name,
                    description: description,
                    image: metadata
                })
            }
        }
        setItems(items)
        setLoading(false)
    }
    const buyMarketItem = async (item) => {
        await (await marketplace.purchaseItem(item.itemId, { value: item.totalPrice })).wait()
        loadMarketplaceItems()
    }
    useEffect(() => {
        loadMarketplaceItems()
    }, [])

    if (loading) return (
        <main style={{ padding: "1rem 0" }}>
            <h2>Loading...</h2>
        </main>
    )

    return (
        <div className="flex justify-center">
            {items.length > 0 ?
                <div className="px-5 container">
                    <Row xs={1} md={2} lg={4} className="g-4 py-5">
                        {items.map((item, idx) => (
                            <Col key={idx} className="overflow-hidden">
                                <Card>
                                    <Card.Img variant="top" src={item.image} />
                                    <Card.Body color="secondary">
                                        <Card.Title>{item.name}</Card.Title>
                                        <Card.Text>
                                            {item.description}
                                        </Card.Text>
                                    </Card.Body>
                                    <Card.Footer>
                                        <div className='d-grid'>
                                            <Button onClick={() => buyMarketItem(item)} variant="primary" size="lg">
                                                Buy for {ethers.utils.formatEther(item.totalPrice)} ETH
                                            </Button>
                                        </div>
                                    </Card.Footer>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>
                : (
                    <main style={{ padding: "1rem 0" }}>
                        <h2>No listed assets</h2>
                    </main>
                )
            }
        </div>
    );
}
export default Home