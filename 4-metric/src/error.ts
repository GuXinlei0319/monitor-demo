// 常规栈错误
window.onerror = function (message, source, lineno, colno, error) {
    console.log("常规错误", message, source, lineno, colno, error);
    fetch("/error", {
        method: "POST",
        body: JSON.stringify({
            message,
            source,
            lineno,
            colno,
            error: error.stack,
        }),
    });
};

// promise 错误
window.onunhandledrejection = (event) => {
    console.log("promise 错误", event.reason.stack, event.reason.message);
    fetch("/error", {
        method: "POST",
        body: JSON.stringify({
            message: event.reason.message,
            source: event.reason.stack,
        }),
    })
};