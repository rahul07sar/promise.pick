/**
 * @file basic-tests.js
 * @description
 * Browser-based basic semantic test suite for Promise.pick.
 *
 * Covers:
 *  - OR-based resolution
 *  - AND-based rejection exhaustion
 *  - Rejection tolerance
 *  - Selector exception handling
 *
 * Requires:
 *  - Promise.pick defined globally
 *  - HTML elements:
 *      #run (button)
 *      #results (div)
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
    log("Running Promise.pick basic tests...\n");

    try {

      {
        const result = await Promise.pick(
          [Promise.resolve(1), Promise.resolve(2)],
          v => v === 2
        );

        assert(result === 2, "Expected to pick value 2");
        log("Test 1: picks matching fulfilled value", "pass");
      }

      {
        let failed = false;

        try {
          await Promise.pick(
            [Promise.resolve(1), Promise.resolve(2)],
            v => v === 3
          );
        } catch {
          failed = true;
        }

        assert(failed, "reject when no match exists");
        log("Test 2: rejects when no match exists", "pass");
      }

      // 3️⃣ Ignores rejected promises when match exists
      {
        const result = await Promise.pick(
          [
            Promise.reject("failure"),
            Promise.resolve(42)
          ],
          v => v === 42
        );

        assert(result === 42, "ignore rejection and pick 42");
        log("Test 3: ignores rejected promises when match exists", "pass");
      }

      {
        let failed = false;

        try {
          await Promise.pick(
            [
              Promise.reject("A"),
              Promise.reject("B")
            ],
            () => true
          );
        } catch {
          failed = true;
        }

        assert(failed, "reject when all promises reject");
        log("Test 4: rejects when all promises reject", "pass");
      }

      {
        let failed = false;

        try {
          await Promise.pick(
            [Promise.resolve(1)],
            () => { throw new Error("boom"); }
          );
        } catch {
          failed = true;
        }

        assert(failed, "reject when selector throws");
        log("Test 5: rejects when selector throws", "pass");
      }

      log("\nAll basic tests passed ✔", "success");

    } catch (err) {
      log("Test failure: " + err.message, "fail");
    }
  }

  if (!runBtn || !results) {
    console.error("Basic tests require #run button and #results container.");
    return;
  }

  runBtn.addEventListener("click", runTests);

})();
