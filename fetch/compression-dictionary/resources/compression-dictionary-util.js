
const kDefaultDictionaryContent = 'This is a test dictionary.\n';
const kDefaultDictionaryHashBase64 =
    ':U5abz16WDg7b8KS93msLPpOB4Vbef1uRzoORYkJw9BY=:';
const kRegisterDictionaryPath = './resources/register-dictionary.py';
const kCompressedDataPath = './resources/compressed-data.py';
const kExpectedCompressedData =
    `This is compressed test data using a test dictionary`;
const kCheckHeaderMaxRetry = 5;
const kCheckHeaderRetryTimeout = 100;

// Calculates the Structured Field Byte Sequence containing the SHA-256 hash of
// the contents of the dictionary text.
async function calculate_dictionary_hash(dictionary_text) {
  const encoded = (new TextEncoder()).encode(dictionary_text);
  const digest = await crypto.subtle.digest('SHA-256', encoded)
  return ':' + btoa(String.fromCharCode(...new Uint8Array(digest))) + ':';
}

// Checks the HTTP request headers which is sent to the server.
async function check_headers() {
  return await (await fetch('./resources/check-headers.py')).json();
}

// Checks the "available-dictionary" header in the HTTP request headers.
async function check_available_dictionary_header() {
  return (await check_headers())['available-dictionary'];
}

// Waits until the "available-dictionary" header is available in the HTTP
// request headers, and returns the header. If the header is not available after
// the specified number of retries, returns an error message. If the
// `expected_header` is specified, this method waits until the header is
// available and matches the `expected_header`.
async function wait_until_available_dictionary_header(
    test,
    {max_retry = kCheckHeaderMaxRetry, expected_header = undefined}) {
  for (let retry_count = 0; retry_count <= max_retry; retry_count++) {
    const header = await check_available_dictionary_header();
    if (header) {
      if (expected_header === undefined || header == expected_header) {
        return header;
      }
    }
    await new Promise(
        (resolve) => test.step_timeout(resolve, kCheckHeaderRetryTimeout));
  }
  return '"available-dictionary" header is not available';
}

// Clears the site data for the specified directive by sending a request to
// `./resources/clear-site-data.py` which returns `Clear-Site-Data` response
// header.
// Note: When `directive` is 'cache' or 'cookies' is specified, registered
// compression dictionaries should be also cleared.
async function clear_site_data(directive = 'cache') {
  return await (await fetch(
                    `./resources/clear-site-data.py?directive=${directive}`))
      .text();
}

// A utility test method that adds the `clear_site_data()` method to the
// testharness cleanup function. This is intended to ensure that registered
// dictionaries are cleared in tests and that registered dictionaries do not
// interfere with subsequent tests.
function compression_dictionary_promise_test(func, name, properties) {
  promise_test(async (test) => {
    test.add_cleanup(clear_site_data);
    await func(test);
  }, name, properties);
}
