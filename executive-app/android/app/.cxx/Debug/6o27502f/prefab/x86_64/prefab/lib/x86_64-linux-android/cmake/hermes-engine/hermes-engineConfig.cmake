if(NOT TARGET hermes-engine::libhermes)
add_library(hermes-engine::libhermes SHARED IMPORTED)
set_target_properties(hermes-engine::libhermes PROPERTIES
    IMPORTED_LOCATION "/Users/madhusudhanm/.gradle/caches/transforms-4/bdc9393c6fd9afba1c60efb640495400/transformed/jetified-hermes-android-0.74.1-debug/prefab/modules/libhermes/libs/android.x86_64/libhermes.so"
    INTERFACE_INCLUDE_DIRECTORIES "/Users/madhusudhanm/.gradle/caches/transforms-4/bdc9393c6fd9afba1c60efb640495400/transformed/jetified-hermes-android-0.74.1-debug/prefab/modules/libhermes/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

