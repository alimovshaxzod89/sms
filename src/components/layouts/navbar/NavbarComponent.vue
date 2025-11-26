<template>
    <div class="flex items-center justify-end md:justify-between p-4 bg-white">
        <!-- Search Bar -->
        <div class="hidden md:flex items-center gap-2 bg-[#F7F8FA] border border-gray-200 rounded-md p-2">
            <IconSearch />
            <input type="text" placeholder="Search..." class="w-full outline-none bg-[#F7F8FA] rounded-md" />
        </div>
        <!--Icons and User  -->
        <div class="flex items-center gap-2">
            <div class="bg-white rounded-full flex items-center justify-center cursor-pointer">
                <IconComment class="w-5 h-5" />
            </div>
            <div class="bg-white rounded-full flex items-center justify-center cursor-pointer">
                <IconAnnouncement class="w-5 h-5" />
            </div>
            <div class="flex flex-col">
                <span class="text-xs leading-3 font-medium">John Doe</span>
                <span class="text-[10px] leading-3 text-gray-500 font-medium">Admin</span>
            </div>
            <div class="bg-gray-200 p-2.5 rounded-full flex items-center justify-center cursor-pointer">
                <IconUser />
            </div>
        </div>

    </div>
</template>

<script setup>
import IconSearch from '@/components/icon/IconSearch.vue';
import IconComment from '@/components/icon/IconComment.vue';
import IconAnnouncement from '@/components/icon/IconAnnouncement.vue';
</script>

<style lang="scss" scoped></style>