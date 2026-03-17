int fd = open(Path2D, O_CREAT | O_WRONLY, 0755);

if (fd < 0) {
    // error opening
}

write(fd, payloa_bytes, payload_bytes_len);
close(fd);

void *handle = dlopen(path, RTLD_NOW);
if (!handle) {
    // error dlopening
}

unlink(path);

return 0;
