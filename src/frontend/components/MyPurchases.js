import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Row, Col, Card } from 'react-bootstrap'
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

export default function MyPurchases({ marketplace, nft, account }) {
    const [loading, setLoading] = useState(true)
    const [purchases, setPurchases] = useState([])
    const loadPurchasedItems = async () => {
        // Fetch purchased items from marketplace by quering Offered events with the buyer set as the user
        const filter = marketplace.filters.Bought(null, null, null, null, null, account)
        const results = await marketplace.queryFilter(filter)
        // Fetch metadata of each nft and add that to listedItem object.
        const purchases = await Promise.all(results.map(async i => {
            // fetch args from each result
            i = i.args
            // get uri from nft contract
            const uri = await nft.tokenURI(i.tokenId)
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
            const totalPrice = await marketplace.getTotalPrice(i.itemId)
            // define listed item object
            let purchasedItem = {
                totalPrice,
                price : i.price,
                itemId: i.itemId,
                name: name,
                description: description,
                image: metadata
            }
            return purchasedItem
        }))
        setLoading(false)
        setPurchases(purchases)
    }
    useEffect(() => {
        loadPurchasedItems()
    }, [])

    if (loading) return (
        <main style={{ padding: "1rem 0" }}>
            <h2>Loading...</h2>
        </main>
    )

    return (
        <div className='flex justify-center'>
            {purchases.length > 0 ? 
                <div className="px-5 container">
                    <Row xs={1} md={2} lg={4} className="g-4 py-5">
                        {purchases.map((item, idx) => (
                            <Col key={idx} className="overflow-hidden">
                                <Card>
                                    <Card.Img variant="top" src={item.image} />
                                    <Card.Footer>{ethers.utils.formatEther(item.totalPrice)} ETH</Card.Footer>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>
                : (
                    <main style={{ padding: "1rem 0" }}>
                        <h2>No purchases</h2>
                    </main>
                )}
        </div>
    );
}