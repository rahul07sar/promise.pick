/**
 * @file edge-tests.js
 * @description
 * Browser-based edge case test suite for Promise.pick.
 */

(function () {

  const results = document.getElementById("results");
  const runBtn = document.getElementById("run");

  function log(message, type = "info") {
    const div = document.createElement("div");
    div.className = "log " + type;
    div.textContent = message;
    results.appendChild(div);
  }

  function assert(condition, message) {
    if (!condition) throw new Error(message);
  }

  async function runTests() {
    results.innerHTML = "";
    log("Running Promise.pick edge tests...\n");

    try {

      {
        let failed = false;
        try {
          await Promise.pick([], () => true);
        } catch {
          failed = true;
        }

        assert(failed, "reject on empty iterable");
        log("Test 1: rejects on empty iterable", "pass");
      }

      {
        let failed = false;
        try {
          await Promise.pick([Promise.resolve(1)], "not-a-function");
        } catch {
          failed = true;
        }

        assert(failed, "throw when selector is not a function");
        log("Test 2: throws on invalid selector", "pass");
      }

      {
        const result = await Promise.pick(
          [1, 2, 3],
          v => v === 3
        );

        assert(result === 3, "wrap non-promise values");
        log("Test 3: handles non-promise values", "pass");
      }

      // 4️⃣ Timing independence (logic > speed)
      {
        const result = await Promise.pick(
          [
            new Promise(res => setTimeout(() => res(10), 100)),
            new Promise(res => setTimeout(() => res(20), 10))
          ],
          v => v === 10
        );

        assert(result === 10, "pick by logic, not fastest");
        log("Test 4: logic-based selection (not race)", "pass");
      }

      {
        const result = await Promise.pick(
          [
            Promise.resolve(5),
            Promise.resolve(5)
          ],
          v => v === 5
        );

        assert(result === 5, "First matching fulfillment win");
        log("Test 5: first matching fulfillment wins", "pass");
      }

      log("\nAll edge tests passed ✔", "success");

    } catch (err) {
      log("✗ Test failure: " + err.message, "fail");
    }
  }

  if (!runBtn || !results) {
    console.error("Edge tests require #run button and #results container.");
    return;
  }

  runBtn.addEventListener("click", runTests);

})();
