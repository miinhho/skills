# Debugging the DOM, input, and focus

## A visible element does not receive clicks

- Find out which element becomes the event target at the coordinates of the user's input. An element can exist in the DOM without being the hit target. In the document where the event occurs, compare the result of `elementFromPoint` with the event target and phase to narrow down where behavior diverges: an overlay, stacking order, `pointer-events`, a disabled state, or the capture or bubbling path.
- If the event reaches the intended handler, check whether the default action was canceled (`defaultPrevented`), what happened next (such as submission or navigation), and whether state was updated. Stopping event propagation and canceling the default action are distinct.
- Change only one suspected factor, such as the presence of an overlay or the viewport width. Calling the handler directly or using `element.click()` bypasses coordinate hit testing. Even if the handler works that way, it does not prove a real click reaches the right element. After the fix, check both real input at the affected location and the normal input path.

## A keypress triggers no action or triggers it twice

- Before and after the affected interaction, check `activeElement`, the document and target where the event occurred, and the handler call count. If a modal or popover opens or closes, a node is replaced, or the frame changes in between, record focus changes and restoration in order. If the issue occurs only during text entry, distinguish `keydown` from `beforeinput`, `input`, and composition events. With an input method editor (IME), such as one used for Korean, check behavior during composition and after it ends separately.
- If the parent document's `activeElement` is an `iframe`, that is a clue that focus is in the child document. Do not assume a key listener in the parent receives DOM events from the child. If observation is allowed and possible, record focus and events in each document separately. If you cannot inspect the child, do not conclude from parent observations alone that the child consumed the keypress.
- Fix duplicate listener registration or incorrect focus transitions where keyboard handling is owned. Do not indiscriminately remove intended modal focus management or default IME behavior. Check closing and reopening, the result of a single keypress, and whether interaction works again after closing. Focus tracing alone does not establish accessible names, roles, or assistive technology behavior.

## The issue occurs only in an in-app WebView

- Map the boundary between the web view and its host app. For example, if the view freezes only during a back gesture, distinguish web navigation events, routing, and scroll restoration from the host's navigation decision and screen transition. Investigate this boundary only if there is evidence that the host is involved, such as an app gesture, a bridge call, or a return to the app.
- Use the same web build and initial state, and record the app version, OS, and input path. First compare a passing path with the failing path inside the affected host. A standalone browser can help identify the web code path they share, but it is not an equivalent control for an app-only gesture or resume sequence.
- If you can collect evidence from both sides, align the web events and host callbacks for the same navigation attempt. The point where web logging stops does not establish that the host is at fault. If the device or host logs are unavailable, record the remaining hypotheses and the real interactions needed to check them. Instead of removing the gesture, verify that both the navigation outcome and the necessary state restoration are preserved.
