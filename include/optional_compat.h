#ifndef DPI_OPTIONAL_COMPAT_H
#define DPI_OPTIONAL_COMPAT_H

// GCC 6.x compatibility: <optional> is experimental
#include <experimental/optional>

#ifndef DPI_OPTIONAL_NS
#define DPI_OPTIONAL_NS std::experimental
#endif

#endif
