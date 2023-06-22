# Data Retrieval Function
The data retrieval function is responsible for retrieving a swap rate from a provided website based on the given currency and maturity inputs. Here are the key features of the function:

- **Input**: The function takes two inputs: a currency and a maturity.
- **Website**: The swap rates are retrieved from the website https://sebgroup.com/our-offering/prospectuses-and-downloads/rates/swap-rates.
- **HTML Parsing**: The function parses the necessary information from the HTML structure of the website to extract the required swap rate.
- **Output**: The function returns the retrieved swap rate.
## Installation

``` npm install ```

## Usage

``` npm run ts -- <currency> <maturity> ```


## Improvements

This function can be improved in the following ways:
- Extract and store the swap rates in a database to avoid having to retrieve the rates from the website every time.
