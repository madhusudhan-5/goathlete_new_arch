if(NOT TARGET fbjni::fbjni)
add_library(fbjni::fbjni SHARED IMPORTED)
set_target_properties(fbjni::fbjni PROPERTIES
    IMPORTED_LOCATION "/Users/madhusudhanm/.gradle/caches/transforms-4/3c5dde19dade6a991082d852d6b04916/transformed/jetified-fbjni-0.6.0/prefab/modules/fbjni/libs/android.armeabi-v7a/libfbjni.so"
    INTERFACE_INCLUDE_DIRECTORIES "/Users/madhusudhanm/.gradle/caches/transforms-4/3c5dde19dade6a991082d852d6b04916/transformed/jetified-fbjni-0.6.0/prefab/modules/fbjni/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

