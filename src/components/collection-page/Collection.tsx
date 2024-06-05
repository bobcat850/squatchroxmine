import { MediaRenderer, useReadContract } from "thirdweb/react";
import { getNFT as getNFT721 } from "thirdweb/extensions/erc721";
import { getNFT as getNFT1155 } from "thirdweb/extensions/erc1155";
import { client } from "@/consts/client";
import { Box, Flex, Heading, Tab, TabList, Tabs, Text } from "@chakra-ui/react";
import { useState } from "react";
import { Link } from "@chakra-ui/next-js";
import { useMarketplaceContext } from "@/hooks/useMarketplaceContext";
import { toEther } from "thirdweb";

export function Collection() {
  // `0` is Listings, `1` is `Auctions`
  const [tabIndex, setTabIndex] = useState<number>(0);
  const {
    type,
    nftContract,
    isLoading,
    allValidListings,
    allAuctions,
    contractMetadata,
  } = useMarketplaceContext();

  // In case the collection doesn't have a thumbnail, we use the image of the first NFT
  const { data: firstNFT, isLoading: isLoadingFirstNFT } = useReadContract(
    type === "ERC1155" ? getNFT1155 : getNFT721,
    {
      contract: nftContract,
      tokenId: 0n,
      queryOptions: {
        enabled: isLoading || contractMetadata?.image,
      },
    }
  );

  const thumbnailImage =
    contractMetadata?.image || firstNFT?.metadata.image || "";

  const listings = allValidListings?.length
    ? allValidListings.filter(
        (item) =>
          item.assetContractAddress.toLowerCase() ===
          nftContract.address.toLowerCase()
      )
    : [];
  return (
    <>
      <Box mt="24px">
        <Flex direction="column" gap="4">
          <MediaRenderer
            client={client}
            src={thumbnailImage}
            style={{
              marginLeft: "auto",
              marginRight: "auto",
              borderRadius: "20px",
              width: "200px",
              height: "200px",
            }}
          />
          <Heading mx="auto">
            {contractMetadata?.name || "Unknown collection"}
          </Heading>
          {contractMetadata?.description && (
            <Text
              maxW={{ lg: "500px", base: "300px" }}
              mx="auto"
              textAlign="center"
            >
              {contractMetadata.description}
            </Text>
          )}

          <Tabs
            variant="soft-rounded"
            mx="auto"
            mt="20px"
            onChange={(index) => setTabIndex(index)}
            isLazy
          >
            <TabList>
              <Tab>Listings ({listings.length || 0})</Tab>
              {/* Support for English Auctions coming soon */}
              {/* <Tab>Auctions ({allAuctions?.length || 0})</Tab> */}
            </TabList>
          </Tabs>
        </Flex>
      </Box>
      <Flex>
        <Flex
          wrap="wrap"
          gap="4"
          mt="40px"
          justifyContent="space-around"
          mx="auto"
        >
          {tabIndex === 0 &&
            listings.length > 0 &&
            listings.map((item) => (
              <Box
                key={item.id}
                rounded="12px"
                as={Link}
                href={`/collection/${nftContract.chain.id}/${
                  nftContract.address
                }/token/${item.asset.id.toString()}`}
                _hover={{ textDecoration: "none" }}
              >
                <Flex direction="column">
                  <MediaRenderer
                    client={client}
                    src={item.asset.metadata.image}
                  />
                  <Text>{item.asset?.metadata?.name ?? "Unknown item"}</Text>
                  <Text>Price</Text>
                  <Text>
                    {toEther(item.pricePerToken)}{" "}
                    {item.currencyValuePerToken.symbol}
                  </Text>
                </Flex>
              </Box>
            ))}
        </Flex>
      </Flex>
    </>
  );
}
